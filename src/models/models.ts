import model from "../schemas/model";

export const selectUsers = async () => {
    const users = await model.find()
    return users 
}
