import { useEffect, useRef } from "react";
const useInfiniteScroll = ({ targetRef, onIntersect, enabled }) => {
    const isLoadingData = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !enabled &&
                    !isLoadingData.current
                ) {
                    isLoadingData.current = true;
                    onIntersect?.();
                    isLoadingData.current = false;
                }
            },
            { root: null, rootMargin: "0px", threshold: 0.8 }
        );
        const element = targetRef.current;
        if (element) {
            observer.observe(element);
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [targetRef, onIntersect]);
};
export default useInfiniteScroll;
