import model from "../schemas/model";

export const selectUsers = async () => {
    const users = await model.find()
    return users 
}

export const findUserById = async (id: String) => {
   const user = await model.findById(id);
   return user
}