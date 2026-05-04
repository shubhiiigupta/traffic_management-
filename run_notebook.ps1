New-Item -ItemType Directory -Force -Path output_results
python -m nbconvert --to notebook --execute Vehicle_Safety_Helmet_Detection.ipynb --output-dir="output_results"
if (Test-Path "runs") {
    if (Test-Path "output_results\runs") {
        Remove-Item -Recurse -Force "output_results\runs"
    }
    Move-Item -Path "runs" -Destination "output_results\runs" -Force
}
