import {Box, Grid} from "@mui/material";
import {DataGrid, GridCellParams, GridColDef} from "@mui/x-data-grid";
import clsx from "clsx";

export const AggregatedInputs = ({aggPrefs, aggJudgements}: AggregatedInputsProps) => {

    function generatePrefCols() {
        const cols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'criteria',
                maxWidth: 150,

            },
            {
                field: 'aggWeights',
                headerName: 'aggregated weights',
                minWidth: 200,
                maxWidth: 300,

            }
        ]

        return cols;

    }

    interface PrefRow {
        id: string,
        criteria: string,
        aggWeights: string
    }

    function generatePrefRows() {

        //error handling
        if (!Array.isArray(aggPrefs)) {
            throw new Error("aggPrefs should be an array of Set<number>");
        }

        const prefRows: PrefRow[] = [];

        for (let i = 0; i < aggPrefs.length; i++) {

            const weights = Array.from(aggPrefs[i]);
            weights.sort();

            const prefRow: PrefRow = {
                id: `crit${i + 1}`,
                criteria: `criterion ${i + 1}`,
                aggWeights: `${weights.join(' ,  ')}`
            }

            prefRows.push(prefRow);
        }

        return prefRows;
    }

    const prefCols: GridColDef[] = generatePrefCols();
    const prefRows: PrefRow[] = generatePrefRows();

    function generateJudgeCols() {

        const judgeCols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'criteria',
                maxWidth: 150,
            }
        ]

        for (let i = 0; i < aggJudgements[0].length; i++) {

            const judgeCol: GridColDef = {
                field: `alt${i + 1}`,
                headerName: `alternative ${i + 1}`,
            }

            console.log('judge col: ', judgeCol);
            judgeCols.push(judgeCol);
        }

        return judgeCols;

    }

    interface JudgeRow {
        id: string,
        criteria: string,

        // aggregated judgements per alternative
        [p: string]: any,
    }

    type AltProperties = {
        [key: string]: any;
    };

    function generateJudgeRows() {

        const judgeRows: JudgeRow[] = [];

        // Generate an object with keys like 'alt1', 'alt2',
        const altProperties: AltProperties = [];

        // array for altProperty names
        let alternatives: string[] = [];

        // iterate over one row to get altProperties
        for (let i = 0; i < aggJudgements[0].length; i++) {
            altProperties.push(`alt${i + 1}`);
            alternatives[i] = `alt${i + 1}`;
        }
        //iterate over rows
        for (let i = 0; i < aggJudgements.length; i++) {

            const judgeRow: JudgeRow = {
                id: `crit${i + 1}`,
                criteria: `criterion ${i + 1}`,
                ...altProperties
            }
            for (let j = 0; j < aggJudgements[i].length; j++) { // iterate over cols

                const aggJudgement = Array.from(aggJudgements[i][j]);
                aggJudgement.sort();
                console.log('aggJudgement: ', aggJudgement);
                const altN = alternatives[j]; // corresponding alt property

                judgeRow[altN] = aggJudgement.join(' ,  ');

            }

            judgeRows.push(judgeRow);
        }

        return judgeRows;

    }

    const judgeCols: GridColDef[] = generateJudgeCols();
    const judgeRows: JudgeRow[] = generateJudgeRows();

    function generateCellClassName(params: GridCellParams<any, number>) {
        if (params.value == null) return '';

        const valueStr = params.value.toString();

        // counts commas in cell
        const commaCount = (valueStr.match(/,/g) || []).length;

        let conflict = -1;
        if (commaCount === 0) {
            conflict = -1; // no conflict
        } else if (commaCount === 1) {
            conflict = 1;
        } else {
            conflict = 2;
        }

        return clsx({
            noConflict: conflict < 0,
            withConflict: conflict === 1,
            withConflicts: conflict > 1,
        });
    }


    return (
        <Box
            sx={{
                height: 1,
                width: '100%',
                // Yellow 50 200
                '& .withConflict': {
                    backgroundColor: '#FFF59D',
                },
                // Amber 50 200
                '& .withConflicts': {
                    backgroundColor: '#FFE082',
                },
            }}
        >
            <Grid container sx={{width: '90%'}} spacing={2}>
                <Grid size={12}>

                </Grid>

                <Grid size={3}>
                    <DataGrid rows={prefRows} columns={prefCols}

                              getCellClassName={generateCellClassName}
                              autoPageSize={false}
                              hideFooter={true}
                    />
                </Grid>
                <Grid sx={{ width:`${judgeRows.length*140}px` }}>
                    <DataGrid rows={judgeRows} columns={judgeCols}

                              getCellClassName={generateCellClassName}
                              autoPageSize={false}
                              hideFooter={true}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export type AggregatedInputsProps = {
    aggPrefs: Set<number>[],
    aggJudgements: Set<number> [][]
}