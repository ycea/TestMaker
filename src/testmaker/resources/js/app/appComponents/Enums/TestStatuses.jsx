export const TestStatusEnum = {
    IsEdited: "isEdited",
    IsPending: "isPending",
    IsPublished: "isPublished",
};
const translateStatus = (status) => {
    switch (status) {
        case TestStatusEnum.IsEdited:
            return "Редактируется";
        case TestStatusEnum.IsPending:
            return "На модерации";
        case TestStatusEnum.IsPublished:
            return "Опубликован";
    }
    return "ERROR";
};
export default translateStatus;
