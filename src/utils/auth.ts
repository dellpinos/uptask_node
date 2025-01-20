import bcrypt from "bcrypt";

export const hashPasword = async (password : string) : Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const checkPassword = async (enteredPassword : string, storedPassword : string) => {
    return await bcrypt.compare(enteredPassword, storedPassword);
}