import axios from "axios";
import { useRef, useState } from "react";
import translateRole, { UserRoleEnum } from "../Enums/UserRoleEnum";
import SearchBar from "../layout/SearchBar";
import useInfiniteScroll from "../Helpers/useInfiniteScroll";
import useLockLogic from "../Helpers/useLockLogic";
import { formatDate } from "../Helpers/UserHelpers";
const AdminPanel = () => {
    const [users, changeUsers] = useState([]);
    const { isLocked, setLock } = useLockLogic();
    const [isGivingBan, settingBan] = useState(false);
    const [isFinished, setFinish] = useState(false);
    const divLoader = useRef();
    const loadUsers = () => {
        axios
            .get("/api/users/", { withCredentials: true })
            .then((response) => {
                if (response.data.data.length == 0) {
                    setFinish(true);
                    return;
                }
                changeUsers(response.data.data);
            })
            .catch((error) => {
                console.error("FAILED TO LOAD USERS", error);
            });
    };
    useInfiniteScroll({
        targetRef: divLoader,
        onIntersect: loadUsers,
        enabled: isFinished,
    });

    if (!users) {
        return <div>Идет загрузка пользователей</div>;
    }
    const searchUser = () => {
        axios
            .get(`/api/users?search=${searchData}`, { withCredentials: true })
            .then((response) => {
                changeUsers(response.data.data);
            })
            .catch((error) => {
                console.error("FAILED TO LOAD USERS", error);
            });
    };
    const banUser = (e, userName, ban_days = 4000) => {
        e.preventDefault();
        axios
            .patch(
                `/api/users/${userName}/ban`,
                { ban_days: ban_days },
                { withCredentials: true }
            )
            .then(() => {
                changeUsers((prevUsers) => {
                    return prevUsers.map((user) => {
                        if (user.name == userName) {
                            let newDate = new Date();
                            newDate.setDate(newDate.getDate() + ban_days);
                            return {
                                ...user,
                                banned_until: newDate.toISOString(),
                            };
                        }
                        return user;
                    });
                });
            })
            .catch((error) => {
                alert("Не удалось забанить пользователя");
                console.error("FAIL TO BAN", error);
            });
    };
    const unBanUser = (e, userName) => {
        e.preventDefault();
        axios
            .patch(`/api/users/${userName}/unban`, {
                withCredentials: true,
            })
            .then(() => {
                changeUsers((prevUsers) => {
                    return prevUsers.map((user) => {
                        if (user.name == userName) {
                            return {
                                ...user,
                                banned_until: null,
                            };
                        }
                        return user;
                    });
                });
            })
            .catch((error) => {
                alert("Не удалось забанить пользователя");
                console.error("FAIL TO BAN", error);
            });
    };
    const changeUserRole = (e, userName, role_to_change) => {
        e.preventDefault();
        axios
            .patch(
                `/api/users/${userName}`,
                { change_to: role_to_change },
                {
                    withCredentials: true,
                }
            )
            .then(() => {
                changeUsers((prevUsers) => {
                    return prevUsers.map((user) => {
                        if (user.name == userName) {
                            return { ...user, role: role_to_change };
                        }
                        return user;
                    });
                });
            })
            .catch((error) => {
                alert("Не удалось изменить пользователя");
                console.error("FAIL TO CHANGE ROLE", error);
            });
    };

    return (
        <div className="d-flex flex-column container align-items-center flex-grow-1">
            <SearchBar
                searchFunction={searchUser}
                inputPlaceholder="введите имя пользователя"
                buttonText="Найти пользователя"
            ></SearchBar>
            <div className="d-flex justify-content-center  w-100">
                <div className="row  row-cols-1 w-100 my-2 gap-3">
                    {users.map((user) => {
                        return (
                            <div className="d-flex flex-column flex-md-row justify-content-between col border border-dark  overflow-auto p-2">
                                <p className="m-2">
                                    {" "}
                                    Имя пользователя: {user.name}
                                </p>
                                {user.banned_until ? (
                                    <p className="m-2">
                                        Забанен до{" "}
                                        {formatDate(user.banned_until)}
                                    </p>
                                ) : (
                                    <p className="m-2">
                                        Дата регистрации{" "}
                                        {formatDate(user.registry_date)}
                                    </p>
                                )}

                                <p className="m-2">
                                    Роль: {translateRole(user.role)}
                                </p>
                                {user.role == UserRoleEnum.Moderator && (
                                    <button
                                        className="m-2 btn btn-warning"
                                        disabled={isLocked}
                                        onClick={(e) => {
                                            setLock(true);
                                            changeUserRole(
                                                e,
                                                user.name,
                                                UserRoleEnum.User
                                            );
                                        }}
                                    >
                                        {" "}
                                        Забрать мод. права
                                    </button>
                                )}
                                {user.role == UserRoleEnum.User && (
                                    <button
                                        className="m-2 btn btn-primary"
                                        disabled={isLocked}
                                        onClick={(e) => {
                                            setLock(true);
                                            changeUserRole(
                                                e,
                                                user.name,
                                                UserRoleEnum.Moderator
                                            );
                                        }}
                                    >
                                        Дать мод. права
                                    </button>
                                )}
                                {user.role != UserRoleEnum.Admin &&
                                    user.banned_until == null &&
                                    !isGivingBan && (
                                        <button
                                            className="m-2 btn btn-danger"
                                            disabled={isLocked}
                                            onClick={(e) => {
                                                settingBan(true);
                                            }}
                                        >
                                            Забанить пользователя
                                        </button>
                                    )}
                                {isGivingBan &&
                                    user.role != UserRoleEnum.Admin && (
                                        <>
                                            <button
                                                className="m-2 btn btn-danger"
                                                disabled={isLocked}
                                                onClick={(e) => {
                                                    setLock(true);
                                                    banUser(e, user.name);
                                                    settingBan(false);
                                                }}
                                            >
                                                Перманентно
                                            </button>
                                            <button
                                                className="m-2 btn btn-warning"
                                                disabled={isLocked}
                                                onClick={(e) => {
                                                    setLock(true);
                                                    banUser(e, user.name, 7);
                                                    settingBan(false);
                                                }}
                                            >
                                                На неделю
                                            </button>
                                            <button
                                                className="m-2 btn btn-primary"
                                                onClick={() => {
                                                    settingBan(false);
                                                }}
                                            >
                                                Отмена
                                            </button>
                                        </>
                                    )}
                                {user.banned_until && (
                                    <button
                                        className="m-2 btn btn-warning"
                                        disabled={isLocked}
                                        onClick={(e) => {
                                            setLock(true);
                                            unBanUser(e, user.name);
                                        }}
                                    >
                                        Разбанить пользователя
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div ref={divLoader} style={{ height: "100px" }}></div>
            </div>
        </div>
    );
};
export default AdminPanel;
