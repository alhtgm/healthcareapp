# Improved seed script with varying bodyfat
$base = 'http://localhost:8000'

# First set profile
$profile = @{
    sex = 'male'
    age = 30
    height_cm = 175
    activity_level = 1.55
    goal_weight_kg = 72
    goal_bodyfat_pct = 15
    goal_calories_kcal = 2000
    goal_rate_kg_per_week = -0.5
}
Invoke-RestMethod -Uri "$base/profile/" -Method Put -Body ($profile | ConvertTo-Json) -ContentType 'application/json' | Out-Null
Write-Host "✅ Profile created"

# Seed 14 days of data with varying weight and bodyfat
for ($i = 13; $i -ge 0; $i--) {
    $d = (Get-Date).AddDays(-$i).ToString('yyyy-MM-dd')
    
    # Weight progression: decreasing trend
    $weight = [math]::Round(74 - $i * 0.15, 1)
    
    # Bodyfat progression: 22% → 18% (realistic fat loss)
    $bodyfat = [math]::Round(22 - $i * 0.3, 1)
    
    # Sleep varies (6-8 hours)
    $sleep = 6.5 + ($i % 3) * 0.5
    
    # Body log
    $bodyLog = @{
        date = $d
        weight_kg = $weight
        bodyfat_pct = $bodyfat
        sleep_hours = $sleep
    }
    Invoke-RestMethod -Uri "$base/body-logs/" -Method Post -Body ($bodyLog | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    
    # Meal logs (varied)
    $breakfastCals = 400 + ($i % 200)
    $lunchCals = 700 + ($i % 300)
    $dinnerCals = 600 + ($i % 250)
    
    $breakfastProtein = 20 + ($i % 15)
    $lunchProtein = 35 + ($i % 20)
    $dinnerProtein = 30 + ($i % 20)
    
    @(
        @{date=$d; meal_type='breakfast'; calories_kcal=$breakfastCals; protein_g=$breakfastProtein},
        @{date=$d; meal_type='lunch'; calories_kcal=$lunchCals; protein_g=$lunchProtein},
        @{date=$d; meal_type='dinner'; calories_kcal=$dinnerCals; protein_g=$dinnerProtein}
    ) | ForEach-Object {
        Invoke-RestMethod -Uri "$base/meal-logs/" -Method Post -Body ($_ | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    }
    
    Write-Host "📅 $d : Weight=$weight kg, Bodyfat=$bodyfat%, Cals=$(($breakfastCals+$lunchCals+$dinnerCals)) kcal"
}

Write-Host ""
Write-Host "✅ Mock data seeded successfully!"
Write-Host ""
Write-Host "📊 Sample data summary:"
Invoke-RestMethod -Uri "$base/dashboard/summary" -Method Get | ConvertTo-Json -Depth 5
