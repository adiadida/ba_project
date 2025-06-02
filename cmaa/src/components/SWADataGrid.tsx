import {
    DataGrid,
    GridCellEditStopParams,
    GridColDef, GridValueGetter,
    GridValueParser
} from "@mui/x-data-grid";
import {useState} from "react";

export const SWADataGrid = ({id, numCols, numRows}: DataGridProps) => {


    function generateColHeaders(): string[] {
        let colHeaders: string[] = ['criteria', 'criterion weight'];

        for (let i: number = 2; i < numCols; i++) {
            colHeaders.push(`alternative ${i - 1}`);
        }
        return colHeaders;
    }

    // define getter, setter, parser for differnt col types

    // parser
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

        if (isNaN(parseInt(valStr,10))) {
            return String(value); //alternative names
        } else if (value) { // judgements as numbers

            let val: number = parseInt(value);
            if (isNaN(val)) val = 0;
            if (val < 1) val = 1;
            if (val > 5) val = 5;

            return val;
        } else return undefined;
    }

    //getter
    /*const getValue: GridValueGetter = (params) => {
     if (params){
         const { id, field } = params;
    const row = rowsData.find(row => row.id === id);
    if (!row) return undefined;

    if (field === 'criteria') {
        return row.criteria;
    } else if (field === 'weight') {
        return row.weight;
    } else {
        return row[field];
    }
     }
    return undefined;
};*/

    function generateCols() {
        const colHeaders: string[] = generateColHeaders();
        let columns: GridColDef[] = [
            {
                field: 'criteria',
                headerName: colHeaders[0],
                width: 150,
                editable: true,
                valueParser: parseStringCell,
                //valueGetter:getValue,
            },
            {
                field: 'weight',
                headerName: colHeaders[1],
                width: 150,
                editable: true,
                valueParser: parsePercentCell,
                //valueGetter:getValue,
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
                    //valueGetter:getValue,

                }
            )
        }

        return columns;
    }

    const cols = generateCols();

    function generateRowHeaders(): string[] {
        let rowHeaders: string[] = ['criteria'];

        for (let i: number = 1; i < numRows - 1; i++) {
            rowHeaders.push(`criterion ${i}`);
        }
        rowHeaders.push('weighted sum');
        return rowHeaders;
    }

    // type for properties based on variable number of alternatives
    type AltProperties = {
        [key: string]: any;
    };


    // Initialize rows
    const initializeRows = () => {
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

    // Hook important for user inputs
    const [rowsData, setRowsData] = useState(initializeRows());


    // Handle cell edit stop event
    const handleCellEditStop = (params: GridCellEditStopParams) => {

    };




    return (
        <DataGrid
            columns={cols}
            rows={rowsData}
            //make weighted sum row not editable - hallelujah!
            isCellEditable={(params) => params.id !== 1000}
            onCellEditStop={handleCellEditStop}
            autoPageSize={false}
            hideFooter={true}
        >

        </DataGrid>
    )

}

export type DataGridProps = {
    id: string;
    numCols: number;
    numRows: number;
}
