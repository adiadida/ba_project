import {Box, Card, CardContent, CardHeader, Grid} from "@mui/material";
import {DataGrid, GridCellParams, GridColDef} from "@mui/x-data-grid";
import {blue} from "@mui/material/colors";
import {getEntropyColor, getMinAndMax} from "@/lib/utils";

export const PotentialPreferenceEntropyDataGrid = ({
                                                       prefsMultiInputs,
                                                       potPrefsEntropy
                                                   }: PotentialPreferenceEntropyProps) => {
// Flatten data to find global min and max
    const {min, max} = getMinAndMax(potPrefsEntropy.flat());


    function generatePrefCols() {
        // get number of preferences
        let maxNumPrefs = 0;
        for (let criterion = 0; criterion < prefsMultiInputs.length; criterion++) {

            if (prefsMultiInputs[criterion].length > maxNumPrefs) {
                maxNumPrefs = prefsMultiInputs[criterion].length;
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
                    //error handling
                    if (typeof value !== 'number') {
                        return null;
                    }

                    let backgroundColor = getEntropyColor(value, min, max);

                    if (value % 1 === 0) { // case: if input is preferences, color needs to be based on entropy

                        // identify criterion -> row has a 'criteria' field to identify the criterion
                        const critProperty = params.row.criteria;

                        const match = critProperty.match(/\d+/); // regex to extract number from string criterion n
                        const critIdx = match ? parseInt(match[0], 10) - 1 : null; // convert string to integer index

                        if (critIdx !== null && potPrefsEntropy[critIdx]) {
                            const val = potPrefsEntropy[critIdx][prefIndex] as number;
                            backgroundColor = getEntropyColor(val, min, max);
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
                            {value % 1 !== 0 && value.toFixed(3) || value % 1 === 0 && value.toFixed()}
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


    const prefCols: GridColDef[] = generatePrefCols();
    const prefEntropyRows: PrefRow[] = generatePrefRows(potPrefsEntropy);
    const prefRows: PrefRow[] = generatePrefRows(prefsMultiInputs);
    return (<Grid>
        <Card style={{backgroundColor: blue[50]}}>
            <CardHeader slotpropstitle={'body1'} title={'Potential Preference Entropy'}/>
            <CardContent>

                <Grid container spacing={2}>
                    <Grid size={6}>
                        <DataGrid columns={prefCols} rows={prefEntropyRows} autoPageSize={false}
                                  hideFooter={true}/>
                    </Grid>
                    <Grid size={6}>
                        <DataGrid columns={prefCols} rows={prefRows} autoPageSize={false}
                                  hideFooter={true}/>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    </Grid>)
}
export type PotentialPreferenceEntropyProps = {
    prefsMultiInputs: number[][]; // prefsMultiInputs[criterion][preference]
    potPrefsEntropy: number[][]
}
/*<Grid container spacing={2}>
                        <Grid size={6}>
                            <DataGrid columns={prefCols} rows={prefAcceptabilityRows} autoPageSize={false}
                                      hideFooter={true}/>
                        </Grid>
                        <Grid size={6}>
                            <DataGrid columns={prefCols} rows={prefRows} autoPageSize={false}
                                      hideFooter={true}/>
                        </Grid>
                    </Grid>*/