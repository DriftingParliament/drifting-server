const allRoles = {
    STUDENT: ['getVehicle','manageVehicle'],
    admin: ['getUsers', 'manageUsers','manageVehicleType'],
    TEACHER:['getStudents,managerStudents']
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights,
};
