import {Box, Grid} from "@mui/material";
import {DataGrid, GridCellParams, GridColDef} from "@mui/x-data-grid";


export const RankAcceptabilityIndices = ({rankAccIdx, rankAccCounter}: RankAcceptabilityProps) => {

    // Flatten data to find global min and max
    const allValues = rankAccIdx.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);


    // Function to interpolate color from green to yellow to red
    // higher number green and lower number red
    const getColor = (value: number): string => {
        // Handle edge cases where minValue == maxValue
        const ratio = minValue === maxValue ? 0 : (value - minValue) / (maxValue - minValue);
        // Invert the ratio so that higher values are green
        const invertedRatio = 1 - ratio;

        let red: number, green: number, blue: number = 0;

        if (invertedRatio <= 0.5) {
            // First half: green to yellow
            // ratioInSegment goes from 0 to 1
            const ratioInSegment = invertedRatio / 0.5;
            red = Math.round(255 * ratioInSegment);
            green = 255;
        } else {
            // Second half: yellow to red
            const ratioInSegment = (invertedRatio - 0.5) / 0.5;
            red = 255;
            green = Math.round(255 * (1 - ratioInSegment));
        }

        return `rgb(${red}, ${green}, ${blue})`;
    };

    const getSolution = () => {
        //const allValues = rankAccCounter.flat();
        //const maxValue = Math.max(...allValues);

        let numInstances: number = 0;
        for (let j = 0; j < rankAccCounter[0].length; j++) {// iterate over one row to sum up instances
            numInstances += rankAccCounter[0][j];
        }

        let altRow: number = -1;
        let rankCol: number = 0;

        let maxValue: number = 0;

        for (let i = 0; i < rankAccCounter.length; i++) {

            if (rankAccCounter[i][0] > maxValue) {

                maxValue = rankAccCounter[i][0];
                altRow = i;
            }
        }

        return `Bei ${maxValue} von ${numInstances} simulierten Instanzen erhält die Alternative ${altRow + 1} den Rang ${rankCol + 1}`;

    }

    const message: string = getSolution();

    function generateCols() {
        const cols: GridColDef[] = [
            {
                field: 'alternatives',
                headerName: 'alternatives',
                minWidth: 100,
                maxWidth: 150
            },
        ]

        // Define other columns
        const otherCols: GridColDef[] = rankAccIdx[0].map((_, colIndex) => ({
            field: `rank${colIndex + 1}`,
            headerName: `rank ${colIndex + 1}`,
            minWidth: 100,
            maxWidth: 150,
            renderCell: (params: GridCellParams) => {
                const value = params.value as number;
                const backgroundColor = getColor(value);
                return (
                    <Box
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {value.toFixed(2)}
                    </Box>
                );
            },
        }));

        cols.push(...otherCols) // flatten array

        return cols;

    }

    const columns: GridColDef[] = generateCols();
    //console.log(columns);


    // type for properties based on variable number of ranks
    type RankProperties = {
        [key: string]: any;
    };


    interface Row {
        id: string,
        alternatives: string,

        [p: string]: any, //variable crit rows
    }

    function generateRows() {

        // Generate an object with keys like 'rank1', 'rank2',
        const rankProperties: RankProperties = [];

        for (let i = 0; i < rankAccIdx[0].length; i++) {
            rankProperties.push(`rank${i + 1}`);
        }


        const rows: Row[] = [];
        // Loop through each criterion (assuming rankAccIdx is an array of arrays)
        for (let i = 0; i < rankAccIdx.length; i++) {
            const row: Row = {
                id: `alt${i + 1}`,
                alternatives: `alternative ${i + 1}`,
            };

            // Assign each alternative's value for this criterion
            for (let j = 0; j < rankProperties.length; j++) {
                row[rankProperties[j]] = rankAccIdx[i][j];
            }

            rows.push(row);
        }


        return rows;

    }

    const rows: Row[] = generateRows();

    //console.log('gen rows ', rows);
    function generatDataGridWidth(rows: Row[]) {

        let width = rows.length*110;

        let extra= 0;

        switch (rows.length) {
            case 1: extra=25; break;
            case 2: extra=25; break;
            case 3: extra=25; break;
            case 4: extra=23; break;
            case 5: extra=15; break;
            case 6: extra=10; break;
            default: extra=15-rows.length; break;

        }

        width+=rows.length*extra;

        return width;

    }

    return (
        <Grid container spacing={2}>
            <Grid>
                {message}
            </Grid>
            <Grid sx={{marginBottom: '1em', width:`${generatDataGridWidth(rows)}px`}}>
                <DataGrid rows={rows} columns={columns}

                          autoPageSize={false}
                          hideFooter={true}
                />
            </Grid>
        </Grid>
    );
}

export type RankAcceptabilityProps = {
    rankAccIdx: number[][],
    rankAccCounter: number[][]
}