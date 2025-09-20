import argparse
import json
from src.data import load_data
from src.model import train_lgb, save_model, load_model, predict_from_model
from src.features import build_features


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", type=str, choices=["train", "predict"], required=True)
    parser.add_argument("--data", type=str, help="Path to training CSV")
    parser.add_argument("--model_output", type=str, help="Path to save trained model")
    parser.add_argument("--model", type=str, help="Path to trained model file")
    parser.add_argument("--input_json", type=str, help="JSON string of input features for prediction")

    args = parser.parse_args()

    if args.mode == "train":
        if not args.data or not args.model_output:
            raise ValueError("For training, you must provide --data and --model_output")

        # Load and preprocess training data
        X, y = load_data(args.data, fit_vectorizer=True)

        # Train model
        model, best_params, rmse, r2, importance_df = train_lgb(X, y)

        # Save model
        save_model(model, args.model_output, importance_df)

        print("\n✅ Training complete")
        print(f"Model saved to: {args.model_output}")
        print(f"Best params: {best_params}")
        print(f"Validation RMSE: {rmse:.2f}")
        print(f"Validation R²: {r2:.3f}")

    elif args.mode == "predict":
        if not args.model or not args.input_json:
            raise ValueError("For prediction, you must provide --model and --input_json")

        # Load trained model
        model = load_model(args.model)

        # Parse input JSON
        inp = json.loads(args.input_json)

        # Run prediction
        pred = predict_from_model(model, inp)

        print(json.dumps({"prediction": pred}, indent=2))


if __name__ == "__main__":
    main()
