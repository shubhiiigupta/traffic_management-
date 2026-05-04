import json
from bs4 import BeautifulSoup

def html_to_ipynb(html_file, ipynb_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Look for standard Jupyter Lab/Notebook code cells
    code_cells = soup.find_all('div', class_='jp-CodeCell')
    if not code_cells:
        code_cells = soup.find_all('div', class_='cell code')

    cells = []
    for cell in code_cells:
        input_div = cell.find('div', class_='jp-InputArea-editor')
        if not input_div:
            input_div = cell.find('div', class_='input_area')
        
        if input_div:
            source_code = input_div.get_text()
            # remove leading/trailing newlines that might be added by html
            source_code = source_code.strip('\r\n')
            
            # Create notebook cell structure
            cell_dict = {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [line + '\n' for line in source_code.split('\n')]
            }
            # Remove the last newline from the last line
            if cell_dict["source"]:
                cell_dict["source"][-1] = cell_dict["source"][-1].rstrip('\n')
                
            cells.append(cell_dict)

    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

    with open(ipynb_file, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1)

    print(f"Successfully converted {html_file} to {ipynb_file} with {len(cells)} cells.")

html_to_ipynb('Vehicle_Safety_Helmet_Detection_jupyter.html', 'Vehicle_Safety_Helmet_Detection.ipynb')
