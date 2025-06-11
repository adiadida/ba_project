'use client'

import {GenericHeader} from "@/components/generics/GenericHeader";
import {useSearchParams} from "next/navigation"; // useRouter hook should be imported from next/navigation
import {useEffect, useState} from "react";

export default function CAAPage() {

    // get data
    const [decisionMakerData, setDecisionMakerData] = useState<{ [dmId: string]: any }>({});
    const searchParams = useSearchParams()


    useEffect(() => {

        // newData[dmId] = {
        //   criteria: parsedData.criteria || "default criteria",
        //   weights: parsedData.weights || [],
        //   alt1 ... altn // other processed data
        // };

        const newData: { [dmId: string]: any } = {};

        // multiple dmIds or a single dmId parameter with multiple values
        /* example data:
        * inputcaa?data={"1"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A1%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A5%2C"alt1"%3A3%2C"alt2"%3A4%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A2%2C"alt1"%3A4%2C"alt2"%3A3%2C"alt3"%3A3}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A25%2C"alt2"%3A31%2C"alt3"%3A17%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A2%2C"alt2"%3A1%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]%2C"2"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A4%2C"alt1"%3A5%2C"alt2"%3A1%2C"alt3"%3A3}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A2%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A3%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A28%2C"alt2"%3A23%2C"alt3"%3A19%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]}
        * */
        searchParams.forEach((value, key) => {
            try {
                // Decode the URL-encoded string
                const decodedString = decodeURIComponent(value);
                // Parse the JSON string
                const parsedData = JSON.parse(decodedString);

                // Use the key as dmId, or if you expect a different structure, adjust accordingly
                const dmId = key;

                // Generate data object for this dmId
                newData[dmId] = parsedData;

            } catch (error) {
                console.error(`Error parsing data for ${key}:`, error);
            }
        });

        //console.log('Generated Data:', newData);
        setDecisionMakerData(newData);
    }, [searchParams]);

    // todo: function that generates aggregation of decisionMakerData
    // todo: aggJudgementMatrix .. Matrix for each altn an array of unique values from decisionMaker judgements for each criterion m (is the mth index of altn array)
    // todo: aggPreferences .. for each criteria the criterion weights of every decisionMaker


    return (<GenericHeader title={'Combinatorial Acceptability Analysis'}/>)
}