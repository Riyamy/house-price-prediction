from src.model import train_lgb, predict_from_model
import pandas as pd

def test_training_and_prediction():
    data = {
        'area':[1000,1500],
        'bedrooms':[2,3],
        'bathrooms':[1,2],
        'year_built':[2010,2015],
        'lat':[12.97,12.98],
        'lon':[77.59,77.60],
        'description':["Nice 2BHK","Spacious 3BHK"],
        'price':[100000,150000]
    }
    df = pd.DataFrame(data)
    X = df.drop(columns=['price'])
    y = df['price']
    model, _, _, _ = train_lgb(X,y)
    inp = {'area':1200,'bedrooms':2,'bathrooms':2,'year_built':2012,'lat':12.97,'lon':77.59,'description':'Modern 2BHK flat'}
    pred = predict_from_model(model, inp)
    assert pred > 0
