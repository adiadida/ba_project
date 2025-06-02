import Grid from "@mui/material/Grid";
import {SWADataGrid} from "@/components/SWADataGrid";

export const SWATables = ({numCols, numRows, numDM}:SWATablesProps) => {

    // Generate an array of React elements representing the tables
  const generateTables = () => {
    const tables = [];
    for (let i = 0; i < numDM; i++) {
      tables.push(
        <Grid key={i} size={{xs: 11, md: 5, lg: 3.8}}>
          <SWADataGrid id={`${i + 1}`} numCols={numCols} numRows={numRows} />
        </Grid>
      );
    }
    return tables;
  };

    return (
        <Grid container spacing={4} size={{xs: 12, md: 12, lg: 12}}
                  sx={{
                      justifyContent: "center",
                      alignItems: "center",
                  }}
            >
            {generateTables()}

            </Grid>
    )
}

export type SWATablesProps = {
    numCols: number,
    numRows: number,
    numDM: number,

}
