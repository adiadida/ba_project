import {DataGrid, GridColDef, GridValueParser} from "@mui/x-data-grid";

export const JudgementsDataGrid = ({judgementMultiInputs, onJudgementChange}: JudgementsDataGridProps) => {

    // get max number of judgement inputs
    function getJudgNumber() {

        let maxJudgNumber = 0;

        for (let crit = 0; crit < judgementMultiInputs.length; crit++) {
            for (let alt = 0; alt < judgementMultiInputs[crit].length; alt++) {
                if (maxJudgNumber < judgementMultiInputs[crit][alt].length) {
                    maxJudgNumber = judgementMultiInputs[crit][alt].length;
                }
            }
        }

        return maxJudgNumber;
    }

    // Callback für Updates
    const handleProcessRowUpdate = (newRow: JudgeRow, oldRow: JudgeRow) => {
        // judgMultiInputs[criterion][alternative][preference]
        // Update eigene Datenstruktur anhand des bearbeiteten Rows
        const critIdx = parseInt(newRow.id.replace("crit", "")) - 1;

        // Create a copy of the existing judgementMultiInputs
        const updated = [...judgementMultiInputs];

        // Update the specific criterion's alternatives with the new values from the edited row
        for (let alt = 0; alt < updated[critIdx].length; alt++) {
            for (let judgIdx = 0; judgIdx < updated[critIdx][alt].length; judgIdx++) {
                const altJudgProperty = `alt${alt + 1}judg${judgIdx + 1}`;
                // Check if the new row has a value for the current alternative judgment
                if (newRow[altJudgProperty] !== undefined) {
                    updated[critIdx][alt][judgIdx] = newRow[altJudgProperty] || undefined; // Default to 0 if empty
                }
            }
        }
        onJudgementChange(updated);
        return newRow;
    };

    // create properties like alt1judg1, alt1judg2
    function createAltJudgProperties() {
        const judgNum = getJudgNumber();

        // Generate an object with keys like 'alt1judg1', 'alt2judg3',
        const altJudgProperties: AltJudgProperties = [];

        for (let alt = 0; alt < judgementMultiInputs[0].length; alt++) {
            for (let judgIdx = 0; judgIdx < judgNum; judgIdx++) {
                altJudgProperties.push(`alt${alt + 1}judg${judgIdx + 1}`);
            }
        }

        return altJudgProperties;
    }

    type AltJudgProperties = {
        [key: string]: any;
    };

    // col type: judgements = int on likert scale 1..5 or empty
    const parseLikertCell: GridValueParser = (value): string | number | undefined => {
        const valStr: string = String(value);

        if (isNaN(parseInt(valStr, 10))) {
            return String(value); //alternative names
        } else if (value) { // judgements as numbers

            let val: number = parseInt(value);
            if (isNaN(val)) val = 0;
            if (val < 1) val = 1;
            if (val > 5) val = 5;

            return val;
        } else return undefined;
    }

    function generateJudgeCols() {

        const altJudgProperties: AltJudgProperties = createAltJudgProperties();

        let fieldNames: string[] = [];

        for (const altJudgKey in altJudgProperties) {
            fieldNames.push(altJudgProperties[altJudgKey]);
        }

        const judgeCols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'criteria',
                maxWidth: 70,
            }
        ]

        // Iterate over fieldNames
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i]; // example alt1judg1
            // get alt number
            const match = fieldName.match(/alt(\d+)/); // Regex to find alt number -> get digit after 'alt'
            const altNum = match ? parseInt(match[1], 10) : -1; // digit is at idx 1: Array [ "alt6", "6" ]

            // get judgeIdx
            const judgMatch = fieldName.match(/judg(\d+)/);
            const judgIdx = judgMatch ? parseInt(judgMatch[1], 10) - 1 : -1;
            //console.log(judgMatch, judgIdx);

            const judgeCol: GridColDef = {
                field: fieldName,
                headerName: fieldName.includes('judg1') ? `a ${altNum}` : '', // only gets a name if it contains judg1, e.g. 'alt1judg1'
                minWidth: 30,
                maxWidth: 45,
                headerAlign: "center",
                editable: true,
                valueParser: parseLikertCell,
            };

            judgeCols.push(judgeCol);
        }

        return judgeCols;

    }


    interface JudgeRow {
        id: string,
        criteria: string,

        // variable altJudg properties
        [p: string]: any,
    }


    function generateJudgeRows(judgArray: number[][][]) {

        const judgeRows: JudgeRow[] = [];

        if (judgArray.length === 0) {
            return judgeRows;
        }

        // Generate an object with keys like 'alt1', 'alt2',
        const altJudgProperties: AltJudgProperties = createAltJudgProperties();


        //iterate over rows
        for (let crit = 0; crit < judgArray.length; crit++) {

            const judgeRow: JudgeRow = {
                id: `crit${crit + 1}`,
                criteria: `c ${crit + 1}`,
                ...altJudgProperties
            }
            for (let alt = 0; alt < judgArray[crit].length; alt++) { // iterate over cols

                for (let judgIdx = 0; judgIdx < judgArray[crit][alt].length; judgIdx++) {

                    const altJudgProperty = `alt${alt + 1}judg${judgIdx + 1}`;
                    judgeRow[altJudgProperty] = judgArray[crit][alt][judgIdx];
                }

            }

            judgeRows.push(judgeRow);
        }

        return judgeRows;
    }

    const judgeRows = generateJudgeRows(judgementMultiInputs);
    const judgeCols = generateJudgeCols();

    return (
        <DataGrid columns={judgeCols} rows={judgeRows}
                  density={'compact'}
                  processRowUpdate={handleProcessRowUpdate}
                  autoPageSize={false}
                  hideFooter={true}/>
    )
}

export type JudgementsDataGridProps = {
    judgementMultiInputs: number[][][]; // judgMultiInputs[criterion][alternative][preference]
    onJudgementChange: (newJudges: number[][][]) => void;
}