import model from "../schemas/model";

export const selectUsers = async () => {
    const users = await model.find()
    return users
};

export const findUserById = async (id: String) => {
    const user = await model.findById(id);
    return user
};

export const findUserByUsername = async (username: String) => {
    const user = await model
        .findOne({ username: username })
        .then((data) => {
            if (data === null) {
                return Promise.reject({ status: 400, message: "invalid username" });
            } else return data
        })
    return user
};

export const findLikesById = async (user_id: String) => {
        const data = await model.find(
          { "items.likes": user_id },
          { items: 1, _id: 0 }
        );
        const likes = data[0].items.filter((item) => {
          if (item.likes.includes(user_id)) {
            return item;
          };
        });
        return likes
};

export const findItemsByUsername = async (username: String) => {
    const items = await model.findOne(
        { username: username },
        { items: 1, _id: 0 }
      ); 
    return items
}