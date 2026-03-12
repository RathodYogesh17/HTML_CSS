

export const responseMessage = {
  
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  unauthorized: "Unauthorized access",
  accessDenied: "You don't have permission to perform this action",
  internalServerError: "Internal Server Error",
  
  dataAlreadyExist: (message: any): any => {return `Please change ${message}, ${message} is already exists!`},
  getDataSuccess: (message: string): any => {return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} successfully retrieved!`},
  addDataSuccess: (message: string): any => {return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} successfully added!`},
  getDataNotFound: (message: string): any => {return `We couldn't find the ${message.toLowerCase()} you requested!`},
  updateDataSuccess: (message: string): any => {return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} has been successfully updated!`},
  updateDataError: (message: string): any => {return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} updating time getting an error!`},
  deleteDataSuccess: (message: string): any => {return `Your ${message.toLowerCase()} has been successfully deleted!`},

}