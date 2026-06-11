@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=Get-Content -Raw -LiteralPath '%~f0';$m='#__'+'PS__#';$i=$s.IndexOf($m);iex $s.Substring($i+$m.Length)"
exit /b
#__PS__#
$ErrorActionPreference='Stop'
$BASE='https://futures.kraken.com/derivatives'
$SYMBOL='PF_QQQXUSD'
Write-Host ''
Write-Host '=== Test eligibilite PF_QQQXUSD - Kraken Futures ===' -ForegroundColor Cyan
Write-Host 'Tes cles restent locales : jamais stockees, envoyees uniquement a Kraken.'
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

$acc=Call 'GET' '/api/v3/accounts' $null
$margin=$acc.accounts.flex.availableMargin
Write-Host ''
Write-Host ('Wallet flex - marge disponible : ' + $margin + ' USD')
if(-not $margin -or [double]$margin -le 0){
  Write-Host 'Pas de marge sur le wallet flex - alimente-le avant le test.' -ForegroundColor Yellow
  Read-Host 'Entree pour fermer'; exit
}

Write-Host ''
Write-Host 'Envoi ordre TEST : BUY 0.001 PF_QQQXUSD @ 350 (limite, NON executable)...'
$res=Call 'POST' '/api/v3/sendorder' @{orderType='lmt';symbol=$SYMBOL;side='buy';size='0.001';limitPrice='350.0'}
Write-Host '--- Reponse Kraken ---'
$res | ConvertTo-Json -Depth 8
$status=$res.sendStatus.status
Write-Host ''
if($status -eq 'placed'){
  Write-Host 'RESULTAT : ELIGIBLE - ordre accepte (place sans s executer).' -ForegroundColor Green
}else{
  Write-Host ('RESULTAT : NON place - status = ' + $status) -ForegroundColor Yellow
  Write-Host '  agreement / region / notEligible          => questionnaire reglementaire ou zone exclue'
  Write-Host '  authenticationError / insufficientPermission => cle SANS permission trade'
  Write-Host '  invalidSize / requiredArgumentMissing      => parametre (PAS l eligibilite)'
}

$c=Call 'POST' '/api/v3/cancelallorders' @{symbol=$SYMBOL}
Write-Host ''
Write-Host ('Annulation des ordres ' + $SYMBOL + ' : ' + $c.cancelStatus.status)
$op=Call 'GET' '/api/v3/openpositions' $null
$mine=@($op.openPositions | Where-Object { $_.symbol -eq 'pf_qqqxusd' -or $_.symbol -eq 'PF_QQQXUSD' })
if($mine.Count -gt 0){ Write-Host 'ATTENTION : position residuelle !' -ForegroundColor Red; $mine | ConvertTo-Json -Depth 6 }
else{ Write-Host 'Aucune position residuelle - OK.' -ForegroundColor Green }
Write-Host ''
Read-Host 'Termine. Appuie sur Entree pour fermer'
