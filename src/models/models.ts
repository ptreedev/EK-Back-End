import model from "../schemas/model";

export const selectUsers = async () => {
    const users = await model.find()
    return users
}

export const findUserById = async (id: String) => {
    const user = await model.findById(id);
    return user
}

export const findUserByUsername = async (username: String) => {
    const user = await model
        .findOne({ username: username })
        .then((data) => {
            if (data === null) {
                return Promise.reject({ status: 400, message: "invalid username" });
            } else return data
        })
    return user
}