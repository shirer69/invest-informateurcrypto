@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=Get-Content -Raw -LiteralPath '%~f0';$m='#__'+'PS__#';$i=$s.IndexOf($m);iex $s.Substring($i+$m.Length)"
exit /b
#__PS__#
$ErrorActionPreference='Stop'
$BASE='https://futures.kraken.com/derivatives'
$CONTROL=@('PF_XBTUSD','PF_PAXGUSD','PF_XAUTUSD')
$XSTOCKS=@('PF_QQQXUSD','PF_SPYXUSD','PF_AAPLXUSD','PF_TSLAXUSD','PF_NVDAXUSD','PF_GOOGLXUSD','PF_MSTRXUSD','PF_HOODXUSD','PF_CRCLXUSD')
$SYMBOLS=$CONTROL+$XSTOCKS
Write-Host ''
Write-Host '=== Test eligibilite xStocks perps (categorie complete) - Kraken Futures ===' -ForegroundColor Cyan
Write-Host 'Cles locales : jamais stockees, envoyees uniquement a Kraken.'
Write-Host 'Chaque ordre est une limite BUY a 50% du marche (NON executable) puis annulee.'
Write-Host ''
$KEY=Read-Host 'Cle PUBLIQUE Futures (permission trade)'
$SECRET=Read-Host 'Cle PRIVEE  Futures (permission trade)'

function Sign($path,$post,$nonce){
  $sha=[System.Security.Cryptography.SHA256]::Create()
  $h=$sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($post+$nonce+$path))
  $hmac=New-Object System.Security.Cryptography.HMACSHA512
  $hmac.Key=[Convert]::FromBase64String($SECRET)
  [Convert]::ToBase64String($hmac.ComputeHash($h))
}
function Call($method,$path,$params){
  $post=''
  if($params){$a=@();foreach($k in $params.Keys){$a+=($k+'='+[uri]::EscapeDataString([string]$params[$k]))};$post=($a -join '&')}
  $nonce=[string][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $auth=Sign $path $post $nonce
  $hd=@{APIKey=$KEY;Nonce=$nonce;Authent=$auth}
  try{
    if($method -eq 'POST'){return Invoke-RestMethod -Uri ($BASE+$path) -Method Post -Headers $hd -ContentType 'application/x-www-form-urlencoded' -Body $post}
    else{$u=$BASE+$path; if($post){$u=$u+'?'+$post}; return Invoke-RestMethod -Uri $u -Method Get -Headers $hd}
  }catch{ return [PSCustomObject]@{error=$_.Exception.Message} }
}

# Specs publiques (tickSize, precision) + marche (mark) pour fixer un prix non executable
$ins=(Invoke-RestMethod -Uri ($BASE+'/api/v3/instruments')).instruments
$tks=(Invoke-RestMethod -Uri ($BASE+'/api/v3/tickers')).tickers
$spec=@{}
foreach($s in $SYMBOLS){
  $i=$ins|Where-Object{$_.symbol.ToUpper() -eq $s}|Select-Object -First 1
  $t=$tks|Where-Object{$_.symbol.ToUpper() -eq $s}|Select-Object -First 1
  if($i -and $t){
    $tick=[double]$i.tickSize; $prec=[int]$i.contractValueTradePrecision; $mark=[double]$t.markPrice
    $minSize=[math]::Pow(10,-$prec)
    $limit=[math]::Floor(($mark*0.5)/$tick)*$tick
    $spec[$s]=@{size=$minSize;limit=$limit}
  }
}

$acc=Call 'GET' '/api/v3/accounts' $null
Write-Host ('Wallet flex - marge disponible : ' + $acc.accounts.flex.availableMargin + ' USD')
Write-Host ''

$results=@()
foreach($s in $SYMBOLS){
  if(-not $spec.ContainsKey($s)){ $results+=[pscustomobject]@{Symbole=$s;Statut='specs?';Verdict='specs introuvables'}; continue }
  $sp=$spec[$s]
  $res=Call 'POST' '/api/v3/sendorder' @{orderType='lmt';symbol=$s;side='buy';size=[string]$sp.size;limitPrice=[string]$sp.limit}
  $st=$res.sendStatus.status; if(-not $st){ $st=$res.error }
  if($st -eq 'placed'){ Call 'POST' '/api/v3/cancelallorders' @{symbol=$s} | Out-Null }
  $verdict = if($st -eq 'placed'){'OUVERTURE OK (eligible)'} elseif($st -eq 'wouldNotReducePosition'){'REDUCE-ONLY (ouverture bloquee)'} else {[string]$st}
  $cat = if($CONTROL -contains $s){'temoin BTC/or'}else{'xStock action'}
  $results+=[pscustomobject]@{Categorie=$cat;Symbole=$s;Statut=$st;Verdict=$verdict}
  Write-Host ('  [' + $cat + '] ' + $s.PadRight(14) + ' -> ' + $verdict)
}

Write-Host ''
Write-Host '================ RECAP ================' -ForegroundColor Cyan
$results | Format-Table -AutoSize
$ctrlOk=@($results|Where-Object{($CONTROL -contains $_.Symbole) -and $_.Statut -eq 'placed'}).Count
$xsRo=@($results|Where-Object{($XSTOCKS -contains $_.Symbole) -and $_.Statut -eq 'wouldNotReducePosition'}).Count
$xsOk=@($results|Where-Object{($XSTOCKS -contains $_.Symbole) -and $_.Statut -eq 'placed'}).Count
Write-Host ('Temoin (BTC/or) ouvrables : ' + $ctrlOk + ' / ' + $CONTROL.Count)
Write-Host ('xStocks actions ouvrables : ' + $xsOk + ' / ' + $XSTOCKS.Count)
if($ctrlOk -eq $CONTROL.Count -and $xsRo -eq $XSTOCKS.Count){
  Write-Host ''
  Write-Host 'PREUVE : ton compte OUVRE bien BTC + or, mais AUCUN derive action (reduce-only).' -ForegroundColor Yellow
  Write-Host '=> La restriction vise specifiquement les DERIVES ACTIONS TOKENISEES (reglementaire/zone),' -ForegroundColor Yellow
  Write-Host '   ce n est PAS un blocage de ton compte ni de ta cle.' -ForegroundColor Yellow
}elseif($xsOk -gt 0){
  Write-Host ('Tu es eligible sur ' + $xsOk + ' xStock(s) => cas par cas.') -ForegroundColor Green
}

# Securite : annule tout ordre eventuel restant
foreach($s in $SYMBOLS){ Call 'POST' '/api/v3/cancelallorders' @{symbol=$s} | Out-Null }
Write-Host ''
Read-Host 'Termine. Appuie sur Entree pour fermer'
