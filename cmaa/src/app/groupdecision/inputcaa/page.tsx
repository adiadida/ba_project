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

    // state for preference multimatrix
    const [preferencesMultiInputs, setPreferencesMultiInputs] = useState<number[][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [bewertungsindex]
    // preferenceCircumstanceCounter
    const preferencesCircumstanceCounterRef = useRef<number[][][] | null>(null);

    // state for judgement multimatrix
    const [judgementsMultiInputs, setJudgementsMultiInputs] = useState<number[][][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [alternativenindex] [bewertungsindex]
    // judgementCircumstanceCounter
    const judgementsCircumstanceCounterRef = useRef<number[][][][] | null>(null);


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


    // function that generates aggregations of decisionMakerData
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


    useEffect(() => {

        if (aggregatedPreferences !== undefined
            && aggregatedPreferences.length > 0
            && aggregatedJudgements !== undefined
            && aggregatedJudgements[0] !== undefined
            && aggregatedJudgements.length > 0
        ) {

            // counters to get conditions for rank 1 from instances
            const prefInst = initializePreferencesMulti();
            setPreferencesMultiInputs(prefInst.preferencesInputs);
            preferencesCircumstanceCounterRef.current = prefInst.prefCircCounter;
            console.log('aggregated prefs in Multimatrix form', prefInst.preferencesInputs);
            console.log('initial prefs counter in Multimatrix form', prefInst.prefCircCounter);

            const judgInst = initializeJudgementsMulti();
            setJudgementsMultiInputs(judgInst.judgementsInputs);
            judgementsCircumstanceCounterRef.current = judgInst.judgCircCounter;
            console.log('aggregated judg in Multimatrix form', judgInst.judgementsInputs);
            console.log('initial judg counter in Multimatrix form', judgInst.judgCircCounter);
        }
    }, [aggregatedPreferences, aggregatedJudgements])


    // interface row object
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

    // for statistics
    const initializePreferencesMulti = () => {

        let preferencesInputs: number[][] = [];

        //console.log('len idx 1 - num Crit',aggregatedJudgements.length);
        //console.log('len idx 2 - num Alts',aggregatedJudgements[0].length);
        for (let crit = 0; crit < aggregatedPreferences.length; crit++) {
            const prefs = Array.from(aggregatedPreferences[crit]).sort(); // convert Set into sorted array
            preferencesInputs[crit] = [];

            for (let prefIdx = 0; prefIdx < prefs.length; prefIdx++) {
                preferencesInputs[crit][prefIdx] = prefs[prefIdx];
            }
            //preferencesInputs[crit] = prefs;
        }

        let prefCircCounter: number[][][] = [];

        const numAlts = aggregatedJudgements[0].length;

        for (let altWinner = 0; altWinner < numAlts; altWinner++) { // [a_i gewinne]

            prefCircCounter[altWinner] = []

            for (let crit = 0; crit < aggregatedPreferences.length; crit++) { // [kriterienindex]
                prefCircCounter[altWinner][crit] = [];

                const numPrefs = Array.from(aggregatedPreferences[crit]).length ?? 1;
                for (let prefIdx = 0; prefIdx < numPrefs; prefIdx++) { // [bewertungsindex]
                    prefCircCounter[altWinner][crit][prefIdx] = 0;
                }
            }
        }

        return {preferencesInputs, prefCircCounter};
    }

    const initializeJudgementsMulti = () => {
        let judgementsInputs: number[][][] = [];

        //console.log('len idx 1 - num Crit',aggregatedJudgements.length);
        //console.log('len idx 2 - num Alts',aggregatedJudgements[0].length);
        for (let crit = 0; crit < aggregatedJudgements.length; crit++) {
            judgementsInputs[crit] = [];
            for (let alt = 0; alt < aggregatedJudgements[crit].length; alt++) {
                judgementsInputs[crit][alt] = [];

                const judgs = Array.from(aggregatedJudgements[crit][alt]).sort(); // convert set into sorted array
                judgementsInputs[crit][alt] = judgs;

            }
        }

        let judgCircCounter: number[][][][] = [];

        const numAlts = aggregatedJudgements[0].length;
        const numCrits = aggregatedJudgements.length;

        for (let altWinner = 0; altWinner < numAlts; altWinner++) { // [a_i gewinne]
            judgCircCounter[altWinner] = [];

            for (let crit = 0; crit < numCrits; crit++) { // [kriterienindex]
                judgCircCounter[altWinner][crit] = [];

                for (let alt = 0; alt < numAlts; alt++) { // [alternativenindex]
                    judgCircCounter[altWinner][crit][alt] = [];

                    const numJudgements = aggregatedJudgements[crit][alt].size;
                    for (let judgeIdx = 0; judgeIdx < numJudgements; judgeIdx++) { // [bewertungsindex]
                        judgCircCounter[altWinner][crit][alt][judgeIdx] = 0;
                    }

                }
            }
        }

        return {judgementsInputs, judgCircCounter};

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

        let alternative: number = 0;

        // rank is array where index is implicitly the rank, the altenative is in ranks[idx]
        for (let rank = 0; rank < ranks.length; rank++) {
            alternative = ranks[rank] - 1; // alternative at rank -1 is row index in rankAccs
            // hier war der Schlawiner
            rankAccs[alternative][rank] += 1;
        }
        setRankAcceptabilityCounter(rankAccs)

        // rank 1 is at index 0 --> altWinner+1 is in ranks[0] --> that is the winner of instance
        const altWinner = ranks[0]-1; // altWinner is correctly initialised with the index of the winner alternative

        const prefCircCounter = preferencesCircumstanceCounterRef.current;
        const judgCircCounter = judgementsCircumstanceCounterRef.current;

        //error handling
        if (prefCircCounter === null || judgCircCounter === null) {
            console.log('Counters not initialized');
            return;
        }

        // [alternative][rank] - rac
        // [row/crit] [col/alternative]
        // update counter for preference of winner from simulated instance
        for (let crit = 0; crit < prefCircCounter[altWinner].length; crit++) { // [kriterienindex]
            //prefCircCounter[altWinner][crit];

            for (let prefIdx = 0; prefIdx < prefCircCounter[altWinner][crit].length; prefIdx++) { // [bewertungsindex]
                //prefCircCounter[altWinner][crit][prefIdx];
                if (preferences[crit] === preferencesMultiInputs[crit][prefIdx]) {
                    prefCircCounter[altWinner][crit][prefIdx] += 1;
                }
            }
        }

        //set counter
        preferencesCircumstanceCounterRef.current = prefCircCounter;

        //update counter for judgements of winner from simulated instance
        for (let crit = 0; crit < judgCircCounter[altWinner].length; crit++) { // [kriterienindex]
            //judgCircCounter[altWinner][crit];

            for (let alt = 0; alt < judgCircCounter[altWinner][crit].length; alt++) { // [alternativenindex]
                //judgCircCounter[altWinner][crit][alternative];

                for (let judgeIdx = 0; judgeIdx < judgCircCounter[altWinner][crit][alt].length; judgeIdx++) { // [bewertungsindex]
                    //judgCircCounter[altWinner][crit][alternative][judgeIdx];
                    if (judgements[crit][alt] === judgementsMultiInputs[crit][alt][judgeIdx]) {
                        judgCircCounter[altWinner][crit][alt][judgeIdx] += 1;
                    }
                }

            }
        }

        // set counter
        judgementsCircumstanceCounterRef.current = judgCircCounter;
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


    const generateRandomInstance = (aggrPreferences: Set<number>[], aggrJudgements: Set<number>[][], seed?: string) => {
        // Initialize generator if seed provided (rng already initialized otherwise)
        if (seed) {
            initializeGenerator(seed);
        }

        // for debugging - test uniformity
        // Use existing counters
        //const dPrefs = dPrefsRef.current!;
        //const dJudges = dJudgesRef.current!;

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
            //dPrefs[i][randIdx] += 1;

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
        for (let i = 0; i < aggrJudgements.length; i++) { // iterate over criteria
            const row = aggrJudgements[i];
            for (let j = 0; j < aggrJudgements[i].length; j++) { // iterate over alternatives
                const cellJudgements: number[] = Array.from(row[j]);

                // index in range of numbers from set
                const randIdx: number = Math.floor(getRandomNumber() * cellJudgements.length);
                judgements[i][j] = cellJudgements[randIdx];
                //dJudges[i][j][randIdx] += 1;
            }
        }
        // update debugging counters
        //dPrefsRef.current = dPrefs;
        //dJudgesRef.current = dJudges;

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

        //console.log('normalized: ', rAIMatrix)
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
        //console.log('d prefs ', dPrefsRef.current);
        //console.log('d judges', dJudgesRef.current);

        createStatistics(rankAcceptabilityCounter, kMonteCarlo);
        //console.log('rankAcceptabilityCounter ', rankAcceptabilityCounter)
        //console.log('rankAcceptabilityIndices ', rankAcceptabilityIndices);
    }

    // for debugging purposes
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

// execute CMAA algorithm when all input parameters are properly set
    useEffect(() => {
        if ( // check if necessary data defined
            Object.keys(decisionMakerData) !== undefined &&
            aggregatedPreferences !== undefined &&
            aggregatedJudgements !== undefined &&
            aggregatedJudgements[0] !== undefined &&
            preferencesMultiInputs !== undefined &&
            judgementsMultiInputs !== undefined &&
            preferencesMultiInputs[0] !== undefined &&
            judgementsMultiInputs[0] !== undefined
            && preferencesMultiInputs.length > 0
            && judgementsMultiInputs.length > 0

        ) {

            //debugging
            //dPrefsRef.current = initializeDPrefs();
            //dJudgesRef.current = initializeDJudges();

            cMAA()
            console.log('judg count', judgementsCircumstanceCounterRef.current);
            console.log('pref count',preferencesCircumstanceCounterRef.current);
        }
    }, [decisionMakerData, aggregatedPreferences, aggregatedJudgements, preferencesMultiInputs, judgementsMultiInputs]);


    // unit testing
    // 1. each sum of row of judgements from alternatives = r1 of that altWinner
    // 2. each sum of row of preferences from criteria = r1 of that altWinner
    // 3. rai: sum of sums of rows = sum of sums of cols = number of alternatives

    // check if in range
    const between = (x:number, min: number, max: number) => {
            return x >= min && x <= max;
        };

    function checkJudgements() {

        let checkSum = 0;

        let judgCounterSum = 0;

        const judgCircCounter = judgementsCircumstanceCounterRef.current!; // ! for error handling

        //error handling
        if (judgCircCounter === null) {
            return;
        }

        for (let altWinner = 0; altWinner < judgCircCounter.length; altWinner++) { // [a_i gewinne]
            //judgCircCounter[altWinner]

            checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col

            for (let crit = 0; crit < judgCircCounter[altWinner].length; crit++) { // [kriterienindex]
                //judgCircCounter[altWinner][crit]

                for (let alt = 0; alt < judgCircCounter[altWinner][crit].length; alt++) { // [alternativenindex]
                    //judgCircCounter[altWinner][crit][alt]
                    judgCounterSum = 0;

                    for (let judgeIdx = 0; judgeIdx < judgCircCounter[altWinner][crit][alt].length; judgeIdx++) { // [bewertungsindex]
                        //judgCircCounter[altWinner][crit][alt][judgeIdx]
                        judgCounterSum += judgCircCounter[altWinner][crit][alt][judgeIdx];
                    }

                    if (checkSum !== judgCounterSum) {
                        console.log('Judgement Counter Check failed');
                        console.log('check sum ',checkSum, ' judg sum ',judgCounterSum);
                    }

                }
            }
        }

    }

    function checkPreferences() {

        const errorMargin = 0.01;

        let checkSum = 0;
        let prefCounterSum = 0;

        const prefCircCounter = preferencesCircumstanceCounterRef.current!; // ! for error handling

        //error handling
        if (prefCircCounter === null) {
            return;
        }

        for (let altWinner = 0; altWinner < prefCircCounter.length; altWinner++) { // [a_i gewinne]
            //prefCircCounter[altWinner]
                        // [row/alts] col[ranks]
            checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col

            for (let crit = 0; crit < prefCircCounter[altWinner].length; crit++) { // [kriterienindex]
                //prefCircCounter[altWinner][crit]
                prefCounterSum = 0;

                for (let prefIdx = 0; prefIdx < prefCircCounter[altWinner][crit].length; prefIdx++) { // [bewertungsindex]
                    // prefCircCounter[altWinner][crit][prefIdx]
                    prefCounterSum += prefCircCounter[altWinner][crit][prefIdx];
                }

                if (!between(prefCounterSum, checkSum-errorMargin, checkSum+errorMargin)) {
                    console.log('Preference Counter Check failed');
                    console.log('check sum ',checkSum, ' prefCounte sum ',prefCounterSum);
                }
            }
        }
    }

    function checkRAI() {

        const numAlts = rankAcceptabilityIndices.length;

        const errorMargin = 0.01;
        const negMarginNumAlts = numAlts - errorMargin;
        const posMarginNumAlts = numAlts + errorMargin;

        let ranksSum = 0;
        let altsSum = 0;

        for (let alt = 0; alt < numAlts; alt++) {

            let altSum = 0;
            for (let rank = 0; rank < numAlts; rank++) {
                altSum += rankAcceptabilityIndices[alt][rank];
                altsSum += rankAcceptabilityIndices[alt][rank];
            }
            if (!between (altSum, 1-errorMargin, 1+errorMargin) && altSum !== 0 ){
                console.log('RAI check failed');
                console.log('alternative sum ', altSum)
            }
        }

        for (let rank = 0; rank < numAlts; rank++) {

            for (let alt = 0; alt < numAlts; alt++) {
                ranksSum += rankAcceptabilityIndices[alt][rank];
            }
        }

        // error handling: case of only initialized matrix
        if (altsSum === 0 && ranksSum === 0) {
            return;
        }



        if (!between(altsSum, negMarginNumAlts, posMarginNumAlts) || !between(ranksSum, negMarginNumAlts, posMarginNumAlts)) {
            console.log('RAI check failed');
            console.log(numAlts, altsSum, ranksSum);
        }

    }


    // unit testing
    useEffect(() => {

        //error handling
        if (
            preferencesMultiInputs.length > 0
            && judgementsMultiInputs.length > 0
            && rankAcceptabilityCounter.length > 0
            && rankAcceptabilityIndices.length > 0
            && preferencesCircumstanceCounterRef.current!.length > 0
            && judgementsCircumstanceCounterRef.current!.length > 0

        ) {

            checkJudgements();
            checkPreferences();
            checkRAI();
        }

    }, [rankAcceptabilityCounter, preferencesCircumstanceCounterRef.current, judgementsCircumstanceCounterRef.current, rankAcceptabilityIndices])

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

            {rankAcceptabilityIndices && rankAcceptabilityIndices.length > 0 && (
                <Grid container size={8} offset={0.2}>
                    <RankAcceptabilityIndices
                        rankAccIdx={rankAcceptabilityCounter}
                        rankAccCounter={rankAcceptabilityCounter}
                    />
                </Grid>
            )}
        </Grid>
    );
}