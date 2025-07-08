import {PreferenceAcceptabilitiesAndEntropy} from "@/components/cmaa/PreferenceAcceptabilitiesAndEntropy";
import {useEffect, useState} from "react";

export const PreferenceStatistics = ({
                                         rankAcceptabilityCounter,
                                         prefCircumstanceCounter,
                                         prefsMultiInputs
                                     }: PreferenceStatisticsProps) => {

    const [kMonteCarlo, setKMonteCarlo] = useState<number>(0);

    useEffect(() => {
        let sum = 0;
        for (let alt = 0; alt < rankAcceptabilityCounter.length; alt++) {
            sum += rankAcceptabilityCounter[alt][0]; // rank 1 is in first col - rAC[alts][ranks]
        }

        setKMonteCarlo(sum);

    }, [rankAcceptabilityCounter]);

    return (

        <PreferenceAcceptabilitiesAndEntropy kMonteCarlo={kMonteCarlo}
                                             prefCircumstanceCounter={prefCircumstanceCounter}
                                             prefsMultiInputs={prefsMultiInputs}/>

    )
}

// need rank acceptability counter, pref inputs, pref circumstance counter
export type PreferenceStatisticsProps = {
    rankAcceptabilityCounter: number[][];
    prefCircumstanceCounter: number[][][];
    prefsMultiInputs: number[][];
}