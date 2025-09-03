import {DataGrid, GridCellParams, GridColDef} from "@mui/x-data-grid";
import {Box, Card, CardContent, CardHeader, Grid} from "@mui/material";
import {blue} from "@mui/material/colors";

export const PotentialJudgementEntropyDataGrid = ({judgementMultiInputs,potJudgEntropy}:PotentialJudgementEntropyProps) => {

  // Flatten data to find global min and max
    const allValues = potJudgEntropy.flat().flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // Function to interpolate color from green to yellow to red
    // lower number green and higehr number red
    // for heatmap
    const getColor = (value: number): string => {
        // Handle edge cases where minValue == maxValue
        const ratio = minValue === maxValue ? 0 : (value - minValue) / (maxValue - minValue);

        let red: number, green: number, blue: number = 0;

        if (ratio <= 0.5) {
            // First half: green to yellow
            // ratioInSegment goes from 0 to 1
            const ratioInSegment = ratio / 0.5;
            red = Math.round(255 * ratioInSegment);
            green = Math.round(255 * (1-ratioInSegment));
        } else {
            // Second half: yellow to red
            const ratioInSegment = (ratio - 0.5) / 0.5;
            red = 255;
            green = Math.round(255 * (1 - ratioInSegment));
        }

        return `rgb(${red}, ${green}, ${blue})`;
    };


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

            const judgeCol: GridColDef = {
                field: fieldName,
                headerName: fieldName.includes('judg1') ? `a ${altNum}` : '', // only gets a name if it contains judg1, e.g. 'alt1judg1'
                minWidth: 50,
                maxWidth: 70,
                headerAlign: "center",
                renderCell: (params: GridCellParams) => {
                    const value = params.value as number | undefined;
                    if (typeof value !== 'number') {
                        return null; // or a placeholder if preferred
                    }
                    let backgroundColor = getColor(value);

                    if (value % 1 === 0) { // case: if input is judgement color needs to be based on entropy

                        // identify criterion -> row has a 'criteria' field to identify the criterion
                        const critProperty = params.row.criteria;

                        const match = critProperty.match(/\d+/); // regex to extract number from string criterion n
                        const critIdx = match ? parseInt(match[0], 10) - 1 : null; // convert string to integer index

                        if (critIdx !== null && potJudgEntropy[critIdx][altNum-1][judgIdx]) {
                            const val = potJudgEntropy[critIdx][altNum - 1][judgIdx];
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
                            {value % 1 !== 0 && value.toFixed(3) || value % 1 === 0 && value.toFixed()}
                        </Box>
                    );
                }

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


    const judgeCols: GridColDef[] = generateJudgeCols();
    const judgRows: JudgeRow[] = generateJudgeRows(judgementMultiInputs);
    const potJudgEntrRows: JudgeRow[] = generateJudgeRows(potJudgEntropy);


  return(
      <Grid>
            <Card style={{backgroundColor: blue[50]}}>
                <CardHeader slotpropstitle={'body1'} title={'Potential Judgement Entropy'}/>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <DataGrid columns={judgeCols} rows={potJudgEntrRows}
                                      disableColumnResize={true}
                                      density={'compact'}
                                      autoPageSize={false}
                                      hideFooter={true}/>
                        </Grid>
                        <Grid size={12}>
                            <DataGrid columns={judgeCols} rows={judgRows}
                                      density={'compact'}
                                      autoPageSize={false}
                                      hideFooter={true}/>
                        </Grid>
                    </Grid>

                </CardContent>
            </Card>
        </Grid>
  )
}


export type PotentialJudgementEntropyProps = {
  judgementMultiInputs: number[][][]; // judgMultiInputs[criterion][alternative][preference]
  potJudgEntropy: number[][][]
}