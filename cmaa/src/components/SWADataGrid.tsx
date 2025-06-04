import {
    DataGrid,
    GridColDef,
    GridValueParser,
} from "@mui/x-data-grid";
import {useCallback, useEffect, useRef, useState} from "react";
import {Button, Grid, Typography} from "@mui/material";
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

// i.. m Zeilen
// j.. n Spalten

export const SWADataGrid = ({id, numCols, numRows}: DataGridProps) => {

    // generate names of cols - cashed
    const generateColHeaders = useCallback(() => {
        let colHeaders: string[] = ['criteria', 'criterion weight'];

        for (let i: number = 2; i < numCols; i++) {
            colHeaders.push(`alternative ${i - 1}`);
        }
        return colHeaders;
    }, [numCols]);


    // parser for different col types
    // error handling: parser adjusts user inputs
    // col type: names of criteria = string
    const parseStringCell: GridValueParser = (value): string => {
        return String(value);
    }

    // col type: criterion weights = percent
    const parsePercentCell: GridValueParser = (value): number => {
        let val = parseInt(value as string);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;

        return val;
    }
    // col type: judgement alternatives = int on likert scale 1..5
    const parseJudgementCell: GridValueParser = (value): string | number | undefined => {
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

    // generate {}[] for cols
    function generateCols() {
        const colHeaders: string[] = generateColHeaders();
        let columns: GridColDef[] = [
            {
                field: 'criteria',
                headerName: colHeaders[0],
                width: 150,
                editable: true,
                valueParser: parseStringCell,
            },
            {
                field: 'weight',
                headerName: colHeaders[1],
                width: 150,
                editable: true,
                valueParser: parsePercentCell,
            },
        ];

        for (let i: number = 2; i < numCols; i++) {
            columns.push(
                {
                    field: `alt${i - 1}`,
                    headerName: colHeaders[i],
                    width: 150,
                    editable: true,
                    valueParser: parseJudgementCell,
                }
            )
        }

        return columns;
    }

    const cols = generateCols();

    // generate names for rows - cashed
    const generateRowHeaders = useCallback(() => {
        let rowHeaders: string[] = ['criteria'];

        for (let i: number = 1; i < numRows - 1; i++) {
            rowHeaders.push(`criterion ${i}`);
        }
        rowHeaders.push('weighted sum');
        return rowHeaders;
    }, [numRows]);


    // type for properties based on variable number of alternatives
    type AltProperties = {
        [key: string]: any;
    };

    interface Row {
        id: number;
        criteria: string;
        weight: number | undefined;

        [p: string]: any;
    }

    // generate initial {}[] for rows
    const initializeRows: () => Array<Row> = () => {
        const rowHeaders = generateRowHeaders();

        //create missing properties in data object
        const colHeaders = generateColHeaders()

        // Generate an object with keys like 'alt1', 'alt2', ..., each initialized to undefined
        const altProperties: AltProperties = colHeaders.reduce((acc, _, index) => {
            acc[`alt${index + 1}`] = undefined;
            return acc;
        }, {} as AltProperties);

        const dataRows: Array<{
            id: number;
            criteria: string;
            weight: number | undefined;
            [key: string]: any; // to allow dynamic alt properties
        }> = [];

        // Criteria rows
        for (let r = 0; r < rowHeaders.length - 2; r++) {
            dataRows.push({
                id: r,
                criteria: rowHeaders[r + 1],
                weight: 50,
                ...altProperties
            });
        }

        dataRows.push(
            {
                id: 1000,
                criteria: rowHeaders[rowHeaders.length - 1],
                weight: undefined,
                ...altProperties
            }
        );

        return dataRows;
    };

    // only initial data - without user inputs
    const [rows, setRows] = useState(() => initializeRows()); // useState to update data
    const prevSumsRef = useRef<{ [key: string]: number } | null>(null); // useRef to prevent infinite loop

    // process user inputs and update row data
    const handleProcessRowUpdate = (newRow: Row) => {

        // update old row
        let updatedRows = rows.map((row) =>
            row.id === newRow.id ? {...row, ...newRow} : row
        );
        // update data
        setRows(updatedRows);

        // return updated row
        return updatedRows.find(row => row.id === newRow.id)!;

    }

    // Compute weighted sum of each alternative
    const computeWeightedSums = (rows: Array<Row>): { [key: string]: number } => {


        // Extract property names containing 'alt'
        const altProperties: string[] = Object.keys(rows[0]).filter(key => key.includes('alt'));

        const sums: { [key: string]: number } = {};
        // Initialize sums for each alternative
        altProperties.forEach((alt) => {
            sums[alt] = 0;
        });

        // Compute sums
        for (let i = 0; i < rows.length; i++) { // iterates over rows
            const row = rows[i];
            console.log(row)
            /*row = {alt1: 1, alt2: 3, criteria: "criterion 1", id: 0, weight: 50}*/

            if (row.id !== 1000) {
                const weight = row.weight ?? 0;

                for (let j = 0; j < altProperties.length; j++) { // iterate over alternative cols
                    const altN = altProperties[j];
                    const judgement: number = row[altN] ?? 0;
                    sums[altN] += (weight * 0.01) * judgement;
                }
            }
        }

        // round to second decimal place

        for (let sumsKey in sums) {
            sums[sumsKey] = Number(sums[sumsKey].toFixed(2));
        }

        return sums;
    };

    // useEffect to update weighted sum row when rows data changes
    useEffect(() => {
        const sums = computeWeightedSums(rows);
        // Check if sums have changed to prevent unnecessary state updates
        const sumsChanged = JSON.stringify(sums) !== JSON.stringify(prevSumsRef.current);
        if (sumsChanged) {
            prevSumsRef.current = sums;
            const sumRowIndex = rows.findIndex(r => r.id === 1000);
            if (sumRowIndex !== -1) {
                // Update existing sum row
                const newSumRow: Row = {
                    ...rows[sumRowIndex],
                    ...sums,
                };
                setRows(prevRows => {
                    const newRows = [...prevRows];
                    newRows[sumRowIndex] = newSumRow;
                    return newRows;
                });
            } else {
                // Add new sum row if missing
                const newSumRow: Row = {
                    id: 1000,
                    criteria: 'weighted sum',
                    weight: undefined,
                    ...sums,
                };
                setRows(prevRows => [...prevRows, newSumRow]);
            }
        }
    }, [rows]); // Runs whenever rows change


    // Function to convert rows to CSV and trigger download
    const downloadCSV = () => {
        if (rows.length === 0) return;

        // Get headers from columns
        const headers = cols.map(col => col.headerName || col.field);

        // Prepare CSV content
        const csvRows = [
            headers.join(','), // header row
            ...rows.map(row => {
                return headers.map(header => {
                    const field = cols.find(c => c.headerName === header)?.field || header;
                    const value = row[field];
                    // Escape quotes and commas in data
                    if (value === undefined || value === null) return '';
                    const valStr = String(value).replace(/"/g, '""');
                    if (valStr.includes(',') || valStr.includes('"')) {
                        return `"${valStr}"`;
                    }
                    return valStr;
                }).join(',');
            }),
        ];

        const csvContent = csvRows.join('\n');

        // Create a blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set filename
        const filename = `decisionmaker_${id}.csv`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <Grid container spacing={2} >
            <Grid container direction={'row'}  spacing={2} alignItems={'space-between'} size={12}>
                <Grid size={8}>
                    <Typography variant={'h6'}>Decision Maker {id}</Typography>
                </Grid>

                <Grid size={4}>
                    <Button startIcon={<FileDownloadRoundedIcon/>} size="medium" variant={'contained'} onClick={downloadCSV}>csv Download</Button>
                </Grid>
            </Grid>
            <Grid size={12}>
                <DataGrid
                    columns={cols}
                    rows={rows}
                    //make weighted sum row not editable - hallelujah!
                    isCellEditable={(params) => params.id !== 1000}
                    processRowUpdate={handleProcessRowUpdate}
                    autoPageSize={false}
                    hideFooter={true}
                />
            </Grid>
        </Grid>
    )

}

export type DataGridProps = {
    id: string;
    numCols: number;
    numRows: number;
}
