import { useEffect } from "react";
const useInfiniteScroll = ({ targetRef, onIntersect, isFinished }) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFinished) {
                    onIntersect?.();
                }
            },
            { root: null, rootMargin: "0px", threshold: 0.1 }
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
