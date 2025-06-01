import {DataGrid} from "@mui/x-data-grid";
import {useState} from "react";

export const SWADataGrid = ({id, numCols, numRows}: DataGridProps) => {


    function generateColHeaders(): string[] {
        let colHeaders: string[] = ['criteria', 'criterion weight'];

        for (let i: number = 2; i < numCols; i++) {
            colHeaders.push(`alternative ${i - 1}`);
        }
        return colHeaders;
    }

    function generateCols() {
        const colHeaders: string[] = generateColHeaders();
        let columns = [
            {field: 'criteria', headerName: colHeaders[0], width: 200, editable: true},
            {field: 'weight', headerName: colHeaders[1], width: 150, editable: true},
        ];

        for (let i: number = 2; i < numCols; i++) {
            columns.push(
                {
                    field: `alt${i - 1}`,
                    headerName: colHeaders[i],
                    width: 150,
                    editable: true,
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

    // Initialize rows
    const initializeRows = () => {
        const rowHeaders = generateRowHeaders();
        const dataRows = [];

        // Criteria rows
        for (let r = 0; r < rowHeaders.length-2; r++) {
            dataRows.push({
                id: r,
                criteria: rowHeaders[r + 1],
                weight: 0.5,
            });
        }

        dataRows.push(
            {
                id: 1000,
                criteria: rowHeaders[rowHeaders.length-1],
                weight: '',

            }
        );

        return dataRows;
    };

    // Hook important for user inputs
    const [rowsData, setRowsData] = useState(initializeRows());



    return (
        <DataGrid
            columns={cols}
            rows={rowsData}
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
//last row shouldnt be editable!!!