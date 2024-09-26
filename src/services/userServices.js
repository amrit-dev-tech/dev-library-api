const dbHandler = require('../config/database'); // Make sure the dbHandler is correctly imported


// Function to get user details by email and role
async function getUserDetailsByEmail(emailId) {
  try {
    console.log(emailId,"email")
    const query = `SELECT Id ,Name,Email,Password,RegisterDate FROM users
    WHERE Email = ?`;

    const queryObj = {
      query: query,
      args: [emailId],
      event: "getUserDetailsByEmail",
    };

    const result = await dbHandler.dbHandler.executeQuery(queryObj);
    console.log(result,"re")

    return result;  // Returning the first row of the result set
  } catch (error) {
   console.log("Error in getUserDetailsByEmail", error, {});
    throw new Error(
        'Error in registerUser'
    )
  }
}

// Function to register a new user
async function registerUser(userName, emailId, password,RegisterDate) {
  try {
    const query = `INSERT INTO users (Name, Email, Password, RegisterDate) VALUES (?,?,?,?)`;

    const queryObj = {
      query: query,
      args: [userName, emailId,password,RegisterDate],  // Using constants to define the role
      event: "registerUser",
    };

    const result = await dbHandler.dbHandler.executeQuery(queryObj);
    return result.insertId;  // Returning the inserted user's ID
  } catch (error) {
    console.log("Error in registerUser", error, {});
    throw new Error('Error in registerUser')
  }
}

// Function to Assined_book to user
async function AssinedBook(userid, Bookid, AssinedDate,ExpireDate) {
    try {
      const query = `INSERT INTO user_bookassined (User_id, Book_id, Assined_by, Date,ExpireDate) VALUES (?,?,?,?,?)`;
  
      const queryObj = {
        query: query,
        args: [userid, Bookid,"Admin",AssinedDate,ExpireDate],  // Using constants to define the role
        event: "AssinedBook",
      };
  
      const result = await dbHandler.dbHandler.executeQuery(queryObj);
      return result.insertId;  // Returning the inserted user's ID
    } catch (error) {
      console.log("Error in Assined_Book", error, {});
      throw new Error('Error in While Assined_Book')
    }
  }


  // Function to get user details by email and role
async function getBooksDetail(Book_id) {
    try {
      console.log(Book_id,"book")
      const query = `SELECT Id ,Title,Deiscription,Author,Category ,Is_active,Is_deleted,Regdate FROM books
      where Id =?`;
  
      const queryObj = {
        query: query,
        args: [Book_id],
        event: "getBooksDetail",
      };
  
      const result = await dbHandler.dbHandler.executeQuery(queryObj);
      console.log(result,"re")
  
      return result;  // Returning the first row of the result set
    } catch (error) {
     console.log("Error in get books Details", error, {});
      throw new Error(
          'Error in Getting Books Details'
      )
    }
  }

  async function getBooksAssinedDetail(Book_id,User_id) {
    try {
      const query = `SELECT Id , User_id, Book_id, Assined_by , Date , is_Assined FROM user_bookassined where Book_id =? and User_id =?`;
  
    
      const queryObj = {
        query: query,
        args: [Book_id,User_id],
        event: "getBooksAssinedDetail",
      };
  
      const result = await dbHandler.dbHandler.executeQuery(queryObj);
      console.log(result,"Assined")
  
      return result;  // Returning the first row of the result set
    } catch (error) {
     console.log("Error in get books assined Details", error, {});
      throw new Error(
          'Error in Getting Books assined Details'
      )
    }
  }


  async function getAllBooksAssinedDetail(User_id,Title,Author) {
    try {
      //const query = `SELECT Id , User_id, Book_id, Assined_by , Date , is_Assined FROM user_bookassined `;
      let query = `
  SELECT 
    uba.Id, uba.User_id, uba.Book_id,  uba.Assined_by,   uba.Date, uba.ExpireDate,  uba.is_Assined,  b.Title AS Book_Title,  b.Author AS Book_Author, 
     u.Name AS User_Name
  FROM 
    user_bookassined uba
  JOIN 
    books b ON uba.Book_id = b.Id
  JOIN 
    users u ON uba.User_id = u.Id WHERE uba.User_id =?`;
  
    const params = [User_id];

if (Title) {
    query += " AND b.Title LIKE ?";
    params.push(`%${Title}%`);
}

if (Author) {
    query += " AND b.Author LIKE ?";
    params.push(`%${Author}%`);
}
    
      const queryObj = {
        query: query,
        args: params,
        event: "getAllBooksAssinedDetail",
      };
  
      const result = await dbHandler.dbHandler.executeQuery(queryObj);
      console.log(result,"Assined")
  
      return result;  // Returning the first row of the result set
    } catch (error) {
     console.log("Error in get books assined Details", error, {});
      throw new Error(
          'Error in Getting Books assined Details'
      )
    }
}

async function getAssinedDetail() {
  try {
    let query = `
SELECT 
  uba.Id, uba.User_id, uba.Book_id,  uba.Assined_by,   uba.Date, uba.ExpireDate,  uba.is_Assined,  b.Title AS Book_Title,  b.Author AS Book_Author, 
   u.Name AS User_Name
FROM 
  user_bookassined uba
JOIN 
  books b ON uba.Book_id = b.Id
JOIN 
  users u ON uba.User_id = u.Id `;
  
    const queryObj = {
      query: query,
      args: [],
      event: "getAssinedDetail",
    };

    const result = await dbHandler.dbHandler.executeQuery(queryObj);
    console.log(result,"Assined")

    return result;  // Returning the first row of the result set
  } catch (error) {
   console.log("Error in get books assined Details", error, {});
    throw new Error(
        'Error in Getting Books assined Details'
    )
  }
}

async function ReAssinedBook(ExpireDate,Book_id,User_id) {
  try {
   // const query = `SELECT Id , User_id, Book_id, Assined_by , Date , is_Assined FROM user_bookassined where Book_id =? and User_id =?`;
   const query = `UPDATE user_bookassined 
   SET ExpireDate = ? 
   WHERE Book_id = ? AND User_id = ?`;
  
    const queryObj = {
      query: query,
      args: [ExpireDate,Book_id,User_id],
      event: "ReAssinedBook",
    };

    const result = await dbHandler.dbHandler.executeQuery(queryObj);
    console.log(result,"Assined")

    return result;  // Returning the first row of the result set
  } catch (error) {
   console.log("Error in get books assined Details", error, {});
    throw new Error(
        'Error in Getting Books assined Details'
    )
  }
}
module.exports = {
  getUserDetailsByEmail,
  registerUser,
  AssinedBook,
  getBooksDetail,
  getBooksAssinedDetail,
  getAllBooksAssinedDetail,
  ReAssinedBook,
  getAssinedDetail,
};
