$base = 'http://localhost:8000'
for ($i = 6; $i -ge 0; $i--) {
    $d = (Get-Date).AddDays(-$i).ToString('yyyy-MM-dd')
    $weight = [math]::Round(72 + $i * 0.3, 2)
    Invoke-RestMethod -Uri "$base/body-logs/" -Method Post -Body (@{date=$d; weight_kg=$weight; bodyfat_pct=15; sleep_hours=7} | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    Invoke-RestMethod -Uri "$base/meal-logs/" -Method Post -Body (@{date=$d; meal_type='breakfast'; calories_kcal=500} | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    Invoke-RestMethod -Uri "$base/meal-logs/" -Method Post -Body (@{date=$d; meal_type='lunch'; calories_kcal=800} | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    Invoke-RestMethod -Uri "$base/meal-logs/" -Method Post -Body (@{date=$d; meal_type='dinner'; calories_kcal=700} | ConvertTo-Json) -ContentType 'application/json' | Out-Null
}

Invoke-RestMethod -Uri "$base/dashboard/summary" -Method Get | ConvertTo-Json -Depth 5
