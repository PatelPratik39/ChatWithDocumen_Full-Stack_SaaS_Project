'use client'

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection,doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';


const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

function useSubscription(){
    const[hasActiveMemberShip, setHasActiveMemberShip] = useState(null);
    const[isOverFileLimit, setIsOverFileLimit] = useState(false);
    const {user} = useUser();

    // Listen to user Document
    const[snapshot, loading, error] = useDocument(
        user && doc(db, 'users', user.id),{
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );
    // listen the user Files
    const [filesSnapshot, fileLoading] = useCollection(
        user && collection(db, "users", user?.id, "files")
    );

    useEffect(() => {
        if(!snapshot) return;

        const data = snapshot.data();
        if(!data) return;
        setHasActiveMemberShip(data.isActiveMemberShip);

    }, [snapshot])

    useEffect(() => {
        if(!filesSnapshot || hasActiveMemberShip == null) return;

        const files = filesSnapshot.docs;
        const userLimit = hasActiveMemberShip ? PRO_LIMIT : FREE_LIMIT;
        console.log("Checking if user has reached file limit...", files.length, userLimit);
        
        setIsOverFileLimit(files.length >= userLimit);

    }, [filesSnapshot, hasActiveMemberShip, PRO_LIMIT, FREE_LIMIT]);

    return {hasActiveMemberShip, isOverFileLimit, loading: loading || fileLoading, error};
}
export default useSubscription;