'use client'

import {GenericHeader} from "@/components/generics/GenericHeader";
import {useSearchParams} from "next/navigation"; // useRouter hook should be imported from next/navigation
import React, {useEffect, useRef, useState} from "react";
import {Button, Grid} from "@mui/material";
import seedrandom from "seedrandom";
import {testData} from "@/components/cmaa/TestData";
import {RankAcceptabilityIndices} from "@/components/cmaa/RankAcceptabilityIndices";
import {AggregatedInputs} from "@/components/cmaa/AggregatedInputs";


export default function CAAPage() {

    // to get and store data
    const [decisionMakerData, setDecisionMakerData] = useState<{ [oid: string]: any }>({});
    const searchParams = useSearchParams()

    // State to hold aggregated preferences
    const [aggregatedPreferences, setAggregatedPreferences] = useState<Set<number>[]>([]);

    // State to hold aggregated judgements
    const [aggregatedJudgements, setAggregatedJudgements] = useState<Set<number>[][]>([]);

    // State to hold rank acceptability counter
    const [rankAcceptabilityCounter, setRankAcceptabilityCounter] = useState<number[][]>([]);
    // State to hold rank acceptability indices
    const [rankAcceptabilityIndices, setRankAcceptabilityIndices] = useState<number[][]>([]);

    //for debugging
    const dPrefsRef = useRef<number[][] | null>(null);
    const dJudgesRef = useRef<number[][][] | null>(null);

    // Fetch and parse data from URL params
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

                // Generate data object for this key
                if (typeof parsedData === 'object' && parsedData !== null) {
                    newData[key] = parsedData;
                    //console.log('new data:', newData);
                } else {
                    console.warn(`Parsed data for ${key} is not an object.`);
                }
            } catch (error) {
                console.error(`Error parsing data for ${key}:`, error);
            }
        });

        if (Object.keys(newData).length === 0) {
            // Use testData if no URL data
            const fallbackData = testData(); // get the 'data' object from testData
            //console.log('test Data:', fallbackData);
            setDecisionMakerData(fallbackData);
        } else {
            //console.log('Generated Data from URL:', newData);
            setDecisionMakerData(newData);
        }
    }, [searchParams]);


    //function that generates aggregations of decisionMakerData
    // Run aggregation whenever decisionMakerData updates
    useEffect(() => {
        const aggPrefs: Set<number>[] = aggPreferences(decisionMakerData);
        setAggregatedPreferences(aggPrefs);
        console.log('Aggregated Preferences:', aggPrefs);

        const aggJudgs: Set<number>[][] = aggJudgements(decisionMakerData);
        setAggregatedJudgements(aggJudgs);
        console.log('Aggregated Judgements:', aggJudgs);

        const initialRACounter: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        setRankAcceptabilityCounter(initialRACounter);
        //console.log('Initial RAC:', initialRACounter);

        const initialRAIndices: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        setRankAcceptabilityIndices(initialRAIndices);
        //console.log('Initial RAI:', initialRACounter);

    }, [decisionMakerData]);


    //interface row object
    interface Row {
        id: number;
        criteria: string;
        weight: number | undefined;

        [p: string]: any;
    }

    const aggPreferences = (data: { [oid: string]: any }): Set<number>[] => {
        let aggPreferences: Set<number>[] = [];

        // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
        const dmData = Object.values(data);

        // error handling
        if (dmData.length === 0) {
            return aggPreferences;
        }

        // from the first decision maker
        const firstDM: Row[] = dmData[0][1]; // first array of row objects
        /* firstDM example data:
         [
          {
            "id": 0,
            "criteria": "criterion 1",
            "weight": 1,
            "alt1": 2,
            "alt2": 5,
            "alt3": 1
          },
          {
            "id": 1,
            "criteria": "criterion 2",
            "weight": 5,
            "alt1": 3,
            "alt2": 4,
            "alt3": 2
          },
          {
            "id": 2,
            "criteria": "criterion 3",
            "weight": 2,
            "alt1": 4,
            "alt2": 3,
            "alt3": 3
          },
          {
            "id": 1000,
            "criteria": "weighted sum",
            "alt1": 25,
            "alt2": 31,
            "alt3": 17,
            "alt4": 0,
            "alt5": 0
          },
          {
            "id": 1001,
            "criteria": "rank",
            "alt1": 2,
            "alt2": 1,
            "alt3": 3,
            "alt4": 4,
            "alt5": 4
          }
        ]
        */
        // Extract criteria keys
        const criteriaArray: string[] = []; // Set has unique values
        firstDM.forEach((object: Row) => {
            if (object.id !== 1000 && object.id !== 1001) {
                criteriaArray.push(object.criteria);
            }
        })

        // Initialize aggPreferences
        criteriaArray.forEach(() => {
            aggPreferences.push(new Set<number>)
        });

        // For each decision maker, gather weights
        const decisionMakers = dmData[0]; // contains an object array for each decision maker

        for (const dmID of Object.keys(decisionMakers)) { // iterate over decision makers
            const decisionMaker = decisionMakers[dmID];

            // set weight for each criterion
            for (let row = 0; row < aggPreferences.length; row++) { // iterate over rows
                const decisionRow = decisionMaker[row];
                if (!decisionRow) continue; // Skip if decisionRow is undefined or null

                if (
                    criteriaArray[row] === decisionRow.criteria &&
                    typeof decisionRow.weight === 'number'
                ) {
                    // add weight to set
                    aggPreferences[row].add(decisionRow.weight);
                }

            }
        }

        return aggPreferences;
        /*
         returns with example data:
         [
            0: Set [1,4] // is "criterion 1"
            1: Set [5,2] // is "criterion 2"
            2: Set [2,3] // is "criterion 2"
        ]
        */
    }

    // aggJudgementMatrix ... Matrix for each criterion m and for each alternative n - a set of unique values from decisionMaker judgements

    const aggJudgements = (data: { [oid: string]: any }): Set<number>[][] => {
        // matrix or 2-dimensional array of Set<number>
        let aggJudgements: Set<number>[][] = [];
        // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
        const dmData = Object.values(data);

        // error handling
        if (dmData.length === 0) {
            return aggJudgements;
        }

        // from the first decision maker
        const firstDM: Row[] = dmData[0][1]; // first array of row objects
        // get criteria
        const criteriaArray: string[] = []; // Set has unique values
        firstDM.forEach((object: Row) => {
            if (object.id !== 1000 && object.id !== 1001) {
                criteriaArray.push(object.criteria);
            }
        })
        // from first row of first decision maker
        const firstRow: Row = firstDM[0];
        // get alternatives
        const alternativesArray: string[] = [];
        // Extract keys starting with 'alt'
        Object.keys(firstRow).forEach((key) => {
            if (key.startsWith('alt')) {
                alternativesArray.push(key);
            }
        });

        //console.log(criteriaArray, alternativesArray);

        const criteriaCount = criteriaArray.length;
        const alternativesCount = alternativesArray.length;

        // Initialize the array with empty sets
        for (let row = 0; row < criteriaCount; row++) {
            aggJudgements[row] = [];
            for (let col = 0; col < alternativesCount; col++) {
                aggJudgements[row][col] = new Set<number>();
            }
        }

        const decisionMakers = dmData[0]; // contains an object array for each decision maker

        for (const dmID of Object.keys(decisionMakers)) { // iterate over decision makers
            const decisionMaker = decisionMakers[dmID];

            // set weight for each criterion
            for (let row = 0; row < criteriaCount; row++) { // iterate over rows = criteria
                const decisionRow = decisionMaker[row];

                for (let col = 0; col < alternativesCount; col++) { // iterate over cols = alternatives
                    if (
                        criteriaArray[row] === decisionRow.criteria && alternativesArray[col] !== undefined
                    ) {
                        const altkey: string = alternativesArray[col];
                        aggJudgements[row][col].add(decisionRow[altkey])
                    }
                }

            }
        }

        return aggJudgements;
    }

    const initializeRankAcceptabilityMatrix = (data: { [oid: string]: any }): number[][] => {
        // rows are implicitly a1...ai alternatives and cols are implicitly r1 ... rj ranks
        let rankAcceptabilityMatrix: number[][] = [];

        // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
        const dmData = Object.values(data);

        // error handling
        if (dmData.length === 0) {
            return rankAcceptabilityMatrix;
        }
        const firstRow: Row = dmData[0][1][0];
        const alternativesArray: string[] = [];
        // Extract keys starting with 'alt'
        Object.keys(firstRow).forEach((key) => {
            if (key.startsWith('alt')) {
                alternativesArray.push(key);
            }
        });

        // Matrix is ixj with i=j... number of alternatives
        for (let i = 0; i < alternativesArray.length; i++) {
            rankAcceptabilityMatrix[i] = [];
            for (let j = 0; j < alternativesArray.length; j++) {
                rankAcceptabilityMatrix[i][j] = 0;
            }
        }

        return rankAcceptabilityMatrix;
    }

    /**
     * Generate ranking based on weighted sum / performances of alternatives
     * highest performance ... rank 1
     */
    const generateRanking = (preferences: number[], judgements: number [][]) => {

        if (preferences.length === 0 || judgements.length === 0) {
            return [];
        }

        // get performances of every alternative
        const performances: number[] = generatePerformances(preferences, judgements);
        //console.log('weighted sums: ', performances);

        // Create an array of alternatives with their performances
        const alternatives = performances.map((performance, index) => ({index, performance}));

        // Sort alternatives in descending order of performance
        alternatives.sort((a, b) => b.performance - a.performance);

        // Extract sorted alternative indices as ranking
        const rankings = alternatives.map(alternative => alternative.index + 1);
        //console.log('rankings ', rankings);

        return rankings;

    }

    /**
     * Simple additive weighting solver: returns weighted sums = performances of each alternative
     */
    const generatePerformances = (preferences: number[], judgements: number[][]): number[] => {
        const performances: number[] = [];

        // getting number of alternatives from first col
        const numberAlts = judgements[0]?.length ?? 0; // assuming all criteria arrays are of same length
        const numberCrits = judgements?.length ?? 0;

        // iterate over cols = alternatives
        for (let alternative = 0; alternative < numberAlts; alternative++) {
            let sum = 0;
            for (let criterion = 0; criterion < numberCrits; criterion++) {
                sum += judgements[criterion][alternative] * preferences[criterion];
            }
            performances[alternative] = sum;
        }

        return performances;
    }
    const updateCounters = (preferences: number[], judgements: number[][], ranks: number[]) => {
        const rankAccs: number[][] = rankAcceptabilityCounter;
        //console.log('rankAccs', rankAccs);

        let rank: number = 0;

        for (let alternative = 0; alternative < ranks.length; alternative++) {
            rank = ranks[alternative] - 1; // rank-1 is col index in rankAccs
            rankAccs[alternative][rank] += 1;
        }
        setRankAcceptabilityCounter(rankAccs)
    }

    // use randomNumberGenerator with uniform chance for Monte Carlo simulations

    // UseRef to hold the seedrandom generator instance
    const rngRef = useRef<seedrandom.PRNG | null>(null);

    // Initialize the seedrandom generator once
    const initializeGenerator = (seed?: string) => {
        //fallback seed
        const superSeed: string = seed ?? 'bombastic1234whydontyouworkthisisveryweirdnosenseforthesenseless';
        rngRef.current = seedrandom(superSeed);
    };

    // Generate random number between 0 and 1
    const getRandomNumber = (): number => {
        if (rngRef.current) {
            return rngRef.current();
        }
        // Fallback if RNG isn't initialized
        console.warn('RNG not initialized!');
        return Math.random(); // fallback to Math.random() as a safe default
    };

    React.useEffect(() => {
        initializeGenerator(/*'4321'*/); // CHANGE SEED HERE
    }, []);

    const initializeDPrefs = () => {
        //for debugging - test uniformity
        let dPrefs: number[][] = []
        for (let i = 0; i < aggregatedPreferences.length; i++) {
            // for debugging
            const length = Array.from(aggregatedPreferences[i]).length ?? 1;
            dPrefs[i] = [];
            dPrefs[i] = Array(length).fill(0);
        }
        return dPrefs;
    }

    const initializeDJudges = () => {
        let dJudges: number[][][] = [];
        for (let i = 0; i < aggregatedJudgements.length; i++) {
            dJudges[i] = [];
            for (let j = 0; j < aggregatedJudgements[i].length; j++) {
                dJudges[i][j] = [];
                const length = Array.from(aggregatedJudgements[i][j]).length ?? 1;
                dJudges[i][j] = Array(length).fill(0);

            }
        }
        return dJudges;
    }

    const generateRandomInstance = (aggrPreferences: Set<number>[], aggrJudgements: Set<number>[][], seed?: string) => {
        // Initialize generator if seed provided (rng already initialized otherwise)
        if (seed) {
            initializeGenerator(seed);
        }

        //for debugging - test uniformity
        // Use existing counters
        const dPrefs = dPrefsRef.current!;
        const dJudges = dJudgesRef.current!;


        let preferences: number[] = [];

        // initiate preference array
        for (let i = 0; i < aggrPreferences.length; i++) {
            preferences[i] = 0;
        }

        //generate numbers from existing weights
        for (let i = 0; i < preferences.length; i++) {
            const cellWeights: number[] = Array.from(aggrPreferences[i]);
            const randIdx = Math.floor(getRandomNumber() * cellWeights.length);
            preferences[i] = cellWeights[randIdx];

            //for debugging
            dPrefs[i][randIdx] += 1;

        }

        // initiate judgments matrix
        let judgements: number[][] = [];
        for (let i = 0; i < aggrJudgements.length; i++) {
            judgements[i] = [];
            for (let j = 0; j < aggrJudgements[i].length; j++) {
                judgements[i][j] = 0;
            }
        }

        // generate values from existing sets
        for (let i = 0; i < aggrJudgements.length; i++) {
            const row = aggrJudgements[i];
            for (let j = 0; j < aggrJudgements[i].length; j++) {
                const cellJudgements: number[] = Array.from(row[j]);

                // index in range of numbers from set
                const randIdx: number = Math.floor(getRandomNumber() * cellJudgements.length);
                judgements[i][j] = cellJudgements[randIdx];
                dJudges[i][j][randIdx] += 1;
            }
        }
        // update counters
        dPrefsRef.current = dPrefs;
        dJudgesRef.current = dJudges;

        //console.log('random instance: ', preferences, judgements);
        return {preferences, judgements};
    }

    const createStatistics = (rankAcceptabilityCounter: number[][], kCM: number) => {
        const counterMatrix = rankAcceptabilityCounter;
        const rAIMatrix = initializeRankAcceptabilityMatrix(decisionMakerData);

        // iterate over 1 col and rows + sum up number of instances
        /*let sum = 0;

        for (let j = 0; j < counterMatrix[0].length; j++) {
            sum += counterMatrix[0][j];
        }

        console.log(`sum: ${sum}`);*/

        // normalize counters with sum of instances
        for (let i = 0; i < rAIMatrix.length; i++) {
            for (let j = 0; j < rAIMatrix[i].length; j++) {
                rAIMatrix[i][j] = counterMatrix[i][j] / kCM;
                //console.log('devision ', counterMatrix[i][j] / kCM)
            }
        }

        console.log('normalized: ', rAIMatrix)
        setRankAcceptabilityIndices(rAIMatrix);

    }

    function cMAA() {

        //error handling
        if (Object.values(decisionMakerData).length === 0 || aggregatedJudgements.length === 0 || aggregatedPreferences.length === 0) {
            return;
        }


        const kMonteCarlo = 10000;
        for (let k = 0; k < kMonteCarlo; k++) {
            const instance = generateRandomInstance(aggregatedPreferences, aggregatedJudgements);
            const ranks = generateRanking(instance.preferences, instance.judgements);
            updateCounters(instance.preferences, instance.judgements, ranks);
        }

        // for debugging
        console.log('d prefs ', dPrefsRef.current);
        console.log('d judges', dJudgesRef.current);

        createStatistics(rankAcceptabilityCounter, kMonteCarlo);
        //console.log('rankAcceptabilityCounter ', rankAcceptabilityCounter)
        //console.log('rankAcceptabilityIndices ', rankAcceptabilityIndices);

    }

// execute CMAA algorithm when all parameters change
    useEffect(() => {
        //console.log('cMAA');
        if ( // check if necessary data defined
            Object.keys(decisionMakerData) !== undefined &&
            aggregatedPreferences !== undefined &&
            aggregatedJudgements !== undefined && aggregatedJudgements[0] !== undefined
        ) {
            //debugging
            dPrefsRef.current = initializeDPrefs();
            dJudgesRef.current = initializeDJudges();

            //console.log('cMAA iteration');
            cMAA();
        }
    }, [decisionMakerData, aggregatedPreferences, aggregatedJudgements]);

    return (
        <Grid container spacing={2} alignItems="center">
            <GenericHeader title="Schritt 2: Combinatorial Acceptability Analysis"/>

            {aggregatedJudgements && aggregatedJudgements.length > 0 && aggregatedPreferences &&
                aggregatedPreferences.length > 0 && (
                    <Grid container size={12} spacing={2} offset={0.2}>
                        <AggregatedInputs
                            aggPrefs={aggregatedPreferences}
                            aggJudgements={aggregatedJudgements}
                        />
                    </Grid>
                )}

            {rankAcceptabilityIndices && rankAcceptabilityIndices.length > 0 && (
                <Grid container size={8} offset={0.2}>
                    <RankAcceptabilityIndices
                        rankAccIdx={rankAcceptabilityIndices}
                        rankAccCounter={rankAcceptabilityCounter}
                    />
                </Grid>
            )}

            {/*{rankAcceptabilityIndices && rankAcceptabilityIndices.length > 0 && (
                <Grid container size={8} offset={0.2}>
                    <RankAcceptabilityIndices
                        rankAccIdx={rankAcceptabilityCounter}
                        rankAccCounter={rankAcceptabilityCounter}
                    />
                </Grid>
            )}*/}
        </Grid>
    );
}