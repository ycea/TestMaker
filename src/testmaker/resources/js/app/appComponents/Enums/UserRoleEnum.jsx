export const UserRoleEnum = {
    User: "user",
    Moderator: "moderator",
    Admin: "admin",
};
const translateRole = (role) => {
    switch (role) {
        case UserRoleEnum.User:
            return "Пользователь";
        case UserRoleEnum.Moderator:
            return "Модератор";
        case UserRoleEnum.Admin:
            return "Администратор";
    }
    return "ERROR";
};
export default translateRole;
