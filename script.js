let dynamicTypingOptions = {};
function handleFileSelect(event) {
    clearForm(false);
    const file = event.target.files[0];

    Papa.parse(file, {
        header: true,
        complete: function(results) {
            displayCheckboxes(results.meta.fields);
            //displaySQL(results.data);
        }
    });
}

function displayCheckboxes(headers) {
    const checkboxesUl = document.getElementById('checkboxes');
    // checkboxesDiv.innerHTML = 'Disable Dynamic Typing for:';
    
    headers.forEach(header => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = header;
        checkbox.name = header;
        checkbox.checked = false;
        
        const label = document.createElement('label');
        label.htmlFor = header;
        label.appendChild(document.createTextNode(header));

        const li = document.createElement('li');
        li.appendChild(checkbox);
        li.appendChild(label);

        // checkboxesDiv.appendChild(checkbox);
        // checkboxesDiv.appendChild(label);
        checkboxesUl.appendChild(li);
    });

    handleGenerateSQL();
}

function displaySQL(data) {
    const tableName = document.getElementById('table-name').value;
    if (!tableName) {
        alert("Please enter a table name.");
        return;
    }

    const nonEmptyRows = data.filter(row => Object.values(row).some(value => value !== null && value !== undefined && value !== ''));

    if (nonEmptyRows.length === 0) {
        alert("No data to generate SQL.");
        clearForm(false);
        return;
    }

    const columnNames = Object.keys(nonEmptyRows[0]);
    const values = nonEmptyRows.map(row => `(${columnNames.map(col => formatValue(row[col])).join(', ')})`);

    const sqlStatement = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES\n${values.join(',\n')};`;

    const outputDiv = document.getElementById('output');
    outputDiv.textContent = sqlStatement;

    // Show or hide the "Copy to Clipboard" button based on data presence
    const copyButton = document.getElementById('copy-button');
    copyButton.style.display = nonEmptyRows.length > 0 ? 'flex' : 'none';

    // Show or hide the "Clear" button based on data or file presence
    const clearButton = document.getElementById('clear-button');
    clearButton.style.display = (nonEmptyRows.length > 0 || document.getElementById('csv-input').value !== '') ? 'inline-block' : 'none';

    // Show ouput
    const outputContainer = document.getElementById('output-container');
    outputContainer.style.display = nonEmptyRows.length > 0 ? 'inline-block' : 'none';

    // Show ouput
    const checkboxesContainer = document.getElementById('checkboxes-container');
    checkboxesContainer.style.display = nonEmptyRows.length > 0 ? 'inline-block' : 'none';
}

function formatValue(value) {
    // Handle null values as SQL NULL
    if (value === null || value === 'NULL') {
        return 'NULL';
    }

    // If it's a string, wrap it in single quotes
    if (typeof value === 'string') {
        return `'${value}'`;
    }

    // If it's not a string, return the value as is
    return value;
}

function copyToClipboard() {
    const outputDiv = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(outputDiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('SQL statement copied to clipboard!');
}

function clearForm(clearFile = true) {
    if(clearFile){
        document.getElementById('csv-input').value = '';
        document.getElementById('table-name').value = '';
    }
    document.getElementById('output').textContent = '';
    document.getElementById('copy-button').style.display = 'none';
    document.getElementById('clear-button').style.display = 'none';
    document.getElementById('output-container').style.display = 'none';
    document.getElementById('checkboxes-container').style.display = 'none';
    dynamicTypingOptions = {};
    const checkboxeUl = document.getElementById('checkboxes');
    checkboxeUl.innerHTML = '';
}

document.getElementById('csv-input').addEventListener('change', handleFileSelect);

function handleGenerateSQL() {
    const fileInput = document.getElementById('csv-input');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        document.querySelectorAll('#checkboxes input[type="checkbox"]').forEach(checkbox => {
            dynamicTypingOptions[checkbox.name] = !checkbox.checked;
        });

        Papa.parse(file, {
            header: true,
            dynamicTyping: dynamicTypingOptions,
            complete: function (results) {
                displaySQL(results.data);
            }
        });
    } else {
        alert("Please choose a CSV file first.");
    }
}
