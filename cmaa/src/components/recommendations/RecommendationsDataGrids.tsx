import {Grid} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {AggregatedInputsProps} from "@/components/cmaa/AggregatedInputs";
import {GridCellParams} from "@mui/x-data-grid";
import {getMinAndMax, getRecommendationColor} from "@/lib/utils";
import {Box} from "@mui/material";


export const RecommendationsDataGrids = ({
                                             aggPrefs,
                                             aggJudgements,
                                             prefRecIdx,
                                             judgRecIdx
                                         }: RecommendationsDataGridsProps) => {

    function generatePrefCols() {
        const cols: GridColDef[] = [
            {
                field: 'criteria',
                headerName: 'Kriterien',
                maxWidth: 150,

            },
            {
                field: 'aggWeights',
                headerName: 'Priorisierungen',
                minWidth: 200,
                maxWidth: 300,
                renderCell: (params: GridCellParams) => {

                    const value = params.value as string;
                    let backgroundColor = '#f5f5f5';
                    // identify criterion -> row has a 'criteria' field to identify the criterion
                    const critProperty = params.row.criteria;
                    //console.log(critProperty); // example 'criterion 3'
                    //console.log(parseInt(critProperty, 10)) //  why is this NaN?
                    const match = critProperty.match(/\d+/); // regex to extract number from string criterion n
                    const critIdx = match ? parseInt(match[0], 10) - 1 : null; // convert string to integer index

                    if (critIdx !== null && prefRecIdx[critIdx]) {
                        const {min, max} = getMinAndMax(prefRecIdx);
                        const val = prefRecIdx[critIdx];
                        backgroundColor = getRecommendationColor(val, min, max);
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
                            {value}
                        </Box>
                    );
                },

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
                criteria: `Kriterium ${i + 1}`,
                aggWeights: `${weights.join(' ,  ')}`,

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
                headerName: 'Kriterien',
                maxWidth: 150,
            }
        ]

        for (let alternative = 0; alternative < aggJudgements[0].length; alternative++) {

            const judgeCol: GridColDef = {
                field: `alt${alternative + 1}`,
                headerName: `Alternative ${alternative + 1}`,
                renderCell: (params: GridCellParams) => {
                    const value = params.value as string;

                    let backgroundColor = '#f5f5f5';

                    // identify criterion -> row has a 'criteria' field to identify the criterion
                    const critProperty = params.row.criteria;

                    const matchCrit = critProperty.match(/\d+/); // regex to extract number from string criterion n
                    const critIdx = matchCrit ? parseInt(matchCrit[0], 10) - 1 : null; // convert string to integer index

                    if (critIdx !== null && judgRecIdx[critIdx][alternative]) {
                        const {min, max} = getMinAndMax(judgRecIdx.flat())
                        const val = judgRecIdx[critIdx][alternative];
                        //console.log('val', val)
                        backgroundColor = getRecommendationColor(val, min, max);
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
                            {value}
                        </Box>
                    );
                }
            }

            //console.log('judge col: ', judgeCol);
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
                criteria: `K ${i + 1}`,
                ...altProperties
            }
            for (let j = 0; j < aggJudgements[i].length; j++) { // iterate over cols

                const aggJudgement = Array.from(aggJudgements[i][j]);
                aggJudgement.sort();
                //console.log('aggJudgement: ', aggJudgement);
                const altN = alternatives[j]; // corresponding alt property

                judgeRow[altN] = aggJudgement.join(' ,  ');

            }

            judgeRows.push(judgeRow);
        }

        return judgeRows;

    }

    const judgeCols: GridColDef[] = generateJudgeCols();
    const judgeRows: JudgeRow[] = generateJudgeRows();

    return (

        <Grid container sx={{width: '90vw'}} spacing={2}>
            <Grid size={{sm: 12, md: 6, lg: 3}}>
                <DataGrid rows={prefRows} columns={prefCols}

                          autoPageSize={false}
                          hideFooter={true}
                          density={'compact'}
                />
            </Grid>
            <Grid sx={{width: `${judgeRows.length * 140}px`}}>
                <DataGrid rows={judgeRows} columns={judgeCols}

                          autoPageSize={false}
                          hideFooter={true}
                          density={'compact'}
                />
            </Grid>
        </Grid>
    )
}

export type RecommendationsDataGridsProps = AggregatedInputsProps & {
    prefRecIdx: number[];
    judgRecIdx: number[][];
};
