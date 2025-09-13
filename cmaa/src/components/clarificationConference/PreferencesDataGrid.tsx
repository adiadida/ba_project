import {DataGrid} from "@mui/x-data-grid";
import {GridColDef} from "@mui/x-data-grid";
import {GridValueParser} from "@mui/x-data-grid";

export const PreferencesDataGrid = ({preferenceMultiInputs, onPreferenceChange}: PreferencesDataGridProps) => {

    // Callback für Updates
    const handleProcessRowUpdate = (newRow: PrefRow, oldRow: PrefRow) => {
        // Update eigene Datenstruktur anhand des bearbeiteten Rows
        const critIdx = parseInt(newRow.id.replace("crit", "")) - 1;

        // Create a deep copy of the existing preferenceMultiInputs
        const updated = structuredClone(preferenceMultiInputs);

        for (let prefIdx = 0; prefIdx < updated[critIdx].length; prefIdx++) {
            const prefProperty =`pref${prefIdx+ 1}`;
            // Check if the new row has a value for the current alternative judgment
                if (newRow[prefProperty] !== undefined) {
                    updated[critIdx][prefIdx] = newRow[prefProperty] || undefined; // Default to undefined if empty
                }
        }

        onPreferenceChange(updated);
        return newRow;
    };

    function generatePrefCols() {
        // get number of preferences
        let maxNumPrefs = 0;
        for (let criterion = 0; criterion < preferenceMultiInputs.length; criterion++) {

            if (preferenceMultiInputs[criterion].length > maxNumPrefs) {
                maxNumPrefs = preferenceMultiInputs[criterion].length;
            }
        }

        // col type: preferences = int on likert scale 1..5 or empty
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

        const cols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'criteria/preferences',
                maxWidth: 100,
            },
        ]
        // variable prefs like pref1, pref2 etc
        // Generate preference columns dynamically
        for (let prefIndex = 0; prefIndex < maxNumPrefs; prefIndex++) {
            cols.push({
                field: `pref${prefIndex + 1}`,
                headerName: '',//`Preference ${prefIndex + 1}`,
                minWidth: 100,
                maxWidth: 150,
                editable: true,
                valueParser: parseLikertCell,
            });
        }

        return cols;

    }

    interface PrefRow {
        id: string,
        criteria: string,

        // variable number of preferences
        [p: string]: any,
    }

    type PreferenceProperties = {
        [key: string]: any;
    };


    // generate rows from preferanceAcceptability
    // generate rows from preferanceMultiInputs
    function generatePrefRows(prefsArray: number[][]) {

        const prefRows: PrefRow[] = [];

        // Generate an object with keys like 'pref1', 'pref2',
        const prefProperties: PreferenceProperties = [];

        // get number of preferences
        let maxNumPrefs = 0;
        for (let criterion = 0; criterion < prefsArray.length; criterion++) {

            if (prefsArray[criterion].length > maxNumPrefs) {
                maxNumPrefs = prefsArray[criterion].length;
            }
        }

        // generate prefProperties
        for (let i = 0; i < maxNumPrefs; i++) {
            prefProperties.push(`pref${i + 1}`);
        }

        for (let crit = 0; crit < prefsArray.length; crit++) {

            const prefRow: PrefRow = {
                id: `crit${crit + 1}`,
                criteria: `criterion ${crit + 1}`,
                ...prefProperties,
            }
            // define prefProperties
            for (let pref = 0; pref < prefsArray[crit].length; pref++) {
                const prefName = `pref${pref + 1}`;
                prefRow[prefName] = prefsArray[crit][pref];
            }

            prefRows.push(prefRow);
        }

        return prefRows;
    }

    const prefRows: PrefRow[] = generatePrefRows(preferenceMultiInputs);
    const prefCols = generatePrefCols();

    return (
        <DataGrid columns={prefCols} rows={prefRows}
                  density={'compact'}
                  processRowUpdate={handleProcessRowUpdate}
                  autoPageSize={false}
                  hideFooter={true}/>
    )
}

export type PreferencesDataGridProps = {
    preferenceMultiInputs: number[][];
    onPreferenceChange: (newPrefs: number[][]) => void;
}