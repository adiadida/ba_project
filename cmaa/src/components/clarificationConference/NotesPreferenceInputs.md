    function generatePrefCols() {
        // get number of preferences
        let maxNumPrefs = 0;
        for (let criterion = 0; criterion < preferenceMultiInputs.length; criterion++) {

            if (preferenceMultiInputs[criterion].length > maxNumPrefs) {
                maxNumPrefs = preferenceMultiInputs[criterion].length;
            }
        }

        const cols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'criteria',
                maxWidth: 100,
            },
        ]
        // variable prefs like pref1, pref2 etc
        // Generate preference columns dynamically
        for (let prefIndex = 0; prefIndex < maxNumPrefs; prefIndex++) {
            cols.push({
                field: `pref${prefIndex + 1}`,
                headerName: `Preference ${prefIndex + 1}`,
                minWidth: 100,
                maxWidth: 150,
                renderCell: (params: GridCellParams) => {
                    const value = params.value as number | undefined;
                    if (typeof value !== 'number') {
                        return null; // or a placeholder if preferred
                    }
                    let backgroundColor = getColor(value);

                    if (value >= 1) { // case: if input is preferences color needs to be based on preferenceAcceptability

                        // identify criterion -> row has a 'criteria' field to identify the criterion
                        const critProperty = params.row.criteria;
                        //console.log(critProperty); // example 'criterion 3'
                        //console.log(parseInt(critProperty, 10)) //  why is this NaN?
                        const match = critProperty.match(/\d+/); // regex to extract number from string criterion n
                        const critIdx = match ? parseInt(match[0], 10) - 1 : null; // convert string to integer index

                        if (critIdx !== null && preferenceAcceptability[critIdx]) {
                            const val = preferenceAcceptability[critIdx][prefIndex];
                            backgroundColor = getColor(val);
                        }
                    }

                    return (
                        <Box
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {value < 1 && value.toFixed(3) || value >= 1 && value.toFixed()}
                        </Box>
                    );
                },
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

export type PreferenceProps = {
    preferenceMultiInputs: number[][];
}