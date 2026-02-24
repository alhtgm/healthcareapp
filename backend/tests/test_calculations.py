from app.services.calculations import mifflin_bmr, katch_bmr, compute_bmr, compute_tdee, recommended_intake


def test_mifflin_male():
    b = mifflin_bmr(70, 175, 30, 'male')
    assert round(b) == round(10*70 + 6.25*175 - 5*30 + 5)


def test_katch():
    lbm = 60
    b = katch_bmr(lbm)
    assert round(b) == round(370 + 21.6 * lbm)


def test_compute_bmr_prefers_katch_when_bodyfat():
    b = compute_bmr(80, 180, 40, 'male', bodyfat_pct=20)
    lbm = 80 * (1 - 0.2)
    assert round(b) == round(370 + 21.6 * lbm)


def test_tdee_and_recommended():
    b = mifflin_bmr(70, 175, 30, 'male')
    tdee = compute_tdee(b, 1.55)
    rec = recommended_intake(tdee, None, -0.5)
    # daily delta ~ (-0.5*7700)/7
    daily_delta = (-0.5*7700)/7.0
    assert round(rec) == round(tdee + daily_delta)
