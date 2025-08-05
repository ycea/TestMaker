import { useEffect } from "react";
const useInfiniteScroll = ({ targetRef, onIntersect, enabled }) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !enabled) {
                    onIntersect?.();
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
