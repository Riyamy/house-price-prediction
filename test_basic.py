from src.model import train_model, predict_from_model
import pandas as pd

def test_training_and_prediction():
    data = {
        'area':[1000,1500],
        'bedrooms':[2,3],
        'bathrooms':[1,2],
        'year_built':[2010,2015],
        'lat':[12.97,12.98],
        'lon':[77.59,77.60],
        'price':[100000,150000]
    }
    df = pd.DataFrame(data)
    X = df.drop(columns=['price'])
    y = df['price']
    model = train_model(X,y)
    inp = {'area':1200,'bedrooms':2,'bathrooms':2,'year_built':2012,'lat':12.97,'lon':77.59}
    pred = predict_from_model(model, inp)
    assert pred > 0
