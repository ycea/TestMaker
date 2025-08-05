const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};
export { formatDate };
