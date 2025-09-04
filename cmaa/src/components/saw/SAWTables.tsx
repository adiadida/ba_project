'use client'
import Grid from "@mui/material/Grid";
import {SAWDataGrid} from "@/components/saw/SAWDataGrid";
import {GenericLikertCard} from "@/components/generics/GenericLikertCard";
import {Button} from "@mui/material";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export const SAWTables = ({numCols, numRows, numDM}: SAWTablesProps) => {

    // central data collection for each decision maker
    const [decisionMakerData, setDecisionMakerData] = useState<{ [dmId: string]: any }>({});

    // state to hold fullness status of tables
    const [areEmpty, setAreEmpty] = useState<boolean>(true);

    // Function to update data for a specific decision maker
    const handleDataChange = (dmId: string, data: any) => {
        setDecisionMakerData(prev => ({...prev, [dmId]: data}));
    };

    const router = useRouter();

    // Navigation and data management
    const handleButtonClick = () => {
        // Serialize decisionMakerData to JSON string
        const dataString = encodeURIComponent(JSON.stringify(decisionMakerData));
        // Navigate to CMAAPage with data as query param
        router.push(`/groupdecision/inputcaa?data=${dataString}`);
    };

    // error handling - Button disabled as long as tables not filled
    // Check if all tables are filled
    const areTablesEmpty = () => {

        for (let i = 0; i < numDM; i++) {
            const dmId = `${i + 1}`;
            const data = decisionMakerData[dmId];

            if (!data || data.length === 0) {
                // No data for this decision maker
                return true;
            }

            for (const row of data) {

                if (typeof row.weight !== 'number' && row.id<1000) {
                        return true; // Invalid weight
                }

                // For rows that contain alt properties (like 'alt1', 'alt2', etc.)
                for (const key in row) {
                    if (key.startsWith('alt')) {
                        const value = row[key];

                        // Check if value is an integer (parser already only allows between 1 and 5)
                        if (
                            typeof value !== 'number'
                        ) {
                            return true; // Invalid alt value
                        }
                    }
                }
            }
        }
        // If all checks pass, tables are filled correctly
        return false;
    };

    // Effect to continuously check fullness of tables onDataChange
    useEffect(() => {
        const isEmpty= areTablesEmpty();
        setAreEmpty(isEmpty);
    },[decisionMakerData])

    // Generate an array of React elements representing the tables
    const generateTables = () => {
        const tables = [];
        for (let i = 0; i < numDM; i++) {
            const dmId = `${i + 1}`;
            tables.push(
                <Grid key={i} size={{xs: 11, md: 5, lg: 3.8}}>
                    <SAWDataGrid id={dmId} numCols={numCols} numRows={numRows}
                                 onDataChange={(data) => handleDataChange(dmId, data)}/>
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
            <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'}
                  size={12}>
                <Grid size={3}>
                    <GenericLikertCard title={'Priorisierung des Kriteriums'} one={'ganz und gar nicht wichtig'}
                                       two={'nicht wichtig'} three={'neutral'} four={'wichtig'}
                                       five={'voll und ganz wichtig'}/>
                </Grid>
                <Grid size={3}>
                    <GenericLikertCard title={'Erfüllung des Kriteriums'} one={'ganz und gar nicht erfüllt'}
                                       two={'nicht erfüllt'} three={'neutral'} four={'erfüllt'}
                                       five={'voll und ganz erfüllt'}/>
                </Grid>
            </Grid>

            {generateTables()}

            <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'flex-end'}
                  size={12}>
                <Grid size={2}>
                    <Button variant={'contained'} disabled={areEmpty} onClick={handleButtonClick}>Diskussion
                        starten</Button>
                </Grid>
            </Grid>

        </Grid>
    )
}

export type SAWTablesProps = {
    numCols: number,
    numRows: number,
    numDM: number,

}
