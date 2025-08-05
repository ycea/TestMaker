import { useEffect, useState } from "react";

const useLockLogic = () => {
    const [isLocked, setLock] = useState(false);
    useEffect(() => {
        if (isLocked) {
            setTimeout(() => {
                setLock(false);
            }, 2000);
        }
    }, [isLocked]);
    return { isLocked, setLock };
};
export default useLockLogic;
