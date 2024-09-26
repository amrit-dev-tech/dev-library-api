// controllers/authController.js
const bcrypt = require('bcrypt');
const { registerUser,getUserDetailsByEmail,AssinedBook,getBooksDetail,getBooksAssinedDetail,getAssinedDetail,ReAssinedBook,getAllBooksAssinedDetail} = require('../services/userServices');
const jwt = require('jsonwebtoken')
const schedule = require('node-schedule');
const xlsx = require('node-xlsx');

// Controller function for user signup
const signup = async (req, res) => {
  const { Name, email, password } = req.body;

  try {

    const existingUser = await getUserDetailsByEmail(email);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const Current_date = new Date();

   await registerUser(Name,email,hashedPassword,Current_date)

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Controller function for user login (can be implemented similarly)
const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const users =  await getUserDetailsByEmail(email)

      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid email ' });
      }
  
      const user = users[0];
      console.log(user,'use')
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid  password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  
      // Send response with the token and user details
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.Name,
          email: user.Email,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
};

// Controller function for Assined Book to User 
const BookAssined = async (req, res) => {
    const { email, Book_id } = req.body;
    let { ExpireDate } = req.body;
  
    try {
      // Find user by email
      const users =  await getUserDetailsByEmail(email)

      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid email ' });
      }
  
      const user = users[0];
      console.log(user,'user')
  
      // find book by id
      const Books =  await getBooksDetail(Book_id)

      if (Books.length === 0) {
        return res.status(400).json({ message: 'Invalid Book_id ' });
      }
  
      const book = Books[0];
      console.log(book,'book')


      // find book Assined or not

      const Assined_Book = await getBooksAssinedDetail(Book_id,user.Id);

   

      const Assined = Assined_Book[0];
      //console.log(Assined.is_Assined,'book')
   let bookStatus
      if(Assined!= undefined && Assined!=null ){
       bookStatus = Assined.is_Assined; 
      }
      
   
       if (bookStatus === 1) {
        return res.status(200).json({ message: 'Book is already assigned' });
      } 


        const Current_date = new Date();
        const futureDate = new Date(Current_date);
     futureDate.setDate(futureDate.getDate() + 30);
     console.log(futureDate)
        if(!ExpireDate){
          ExpireDate = futureDate
        }
  
      await AssinedBook(user.Id, Book_id,Current_date,ExpireDate);    
  
  
      // Send response with the token and user details
      res.status(200).json({
        message: 'Book assigned successfully',
        user: {
          id: user.id,
          username: user.Name,
          email: user.Email,
        },
        book: {
          id: book.id,
          title: book.Title,
          assignedTo: user.Name,
        },
      });
    } catch (error) {
      console.error('Error during Assined Books:', error);
      res.status(500).json({ error: 'Server error during Assined' });
    }
};


// Controller function for Get Assind book 
const AssinedDetail = async (req, res) => {
    const { Userid,Title,Author } = req.body;
  
    try {
      // Find user by email
      const AssignedBooks =  await getAllBooksAssinedDetail(Userid,Title,Author);

      if (AssignedBooks.length === 0) {
        return res.status(400).json({ message: 'User Not Assined Any book ' });
      }
  
      const AssignedBook = AssignedBooks[0];
      console.log(AssignedBooks,'All')

      //return res.status(200).json({ assignedBooks: AssignedBooks });
      const userName = AssignedBooks[0].User_Name;
      
      const response = {
        name: userName,
         message: "Books assigned Books Details",
        assignedBooks: AssignedBooks.map(book => ({
            Book_Title: book.Book_Title,
            Book_Author: book.Book_Author,
            Start_Date: book.Date,
            Expire_Date: book.ExpireDate,
            Assigned_by: book.Assined_by,
            is_Assigned: book.is_Assizned
        }))
        };
    return res.status(200).json(response);


    } catch (error) {
      console.error('Error during Get Data:', error);
      res.status(500).json({ error: 'Server error during Get data' });
    }
};


const job = schedule.scheduleJob('*/60 * * * *', async function() {
  console.log('Running a task every minute');
  
  try {
    await Expirebook(); 
  } 
  catch (error) {
    console.error("Error running Expirebook:", error);
  }
});

// async function Expirebook() {
//   console.log("Task executed at:", new Date().toLocaleTimeString());
  
//   try {
//     // Assuming getAssinedDetail is an asynchronous function
//     const AssignedBooks = await getAssinedDetail();
//     console.log("Assigned Books:", AssignedBooks);

//     const Current_date = new Date();

//       // Log the entire AssignedBooks object
//       console.log("Assigned Books:", JSON.stringify(AssignedBooks, null, 2));
    
//       // If AssignedBooks is an array, loop through it to access each item's properties
//       if (Array.isArray(AssignedBooks)) {
//         AssignedBooks.forEach(book => {
          
//           console.log("Expire Date:", book.ExpireDate); // Accessing ExpireDate for each book


//           const expireDate = new Date(book.ExpireDate);
//           expireDate.setDate(expireDate.getDate() + 30);

//           if (expireDate < Current_date) {
//             console.log(`Book ID ${book.Book_id} has expired.`, expireDate.toLocaleDateString());
//             console.log(`User ID ${book.User_id} has expired.`);

//         ReAssinedBook(expireDate,book.Book_id,book.User_id);


//           }
//           else {
//             console.log(`Book ID ${book.Book_id} is still valid.`);
//           }




//         });
//       } else {
//         console.log("Assigned Books is not an array or has no records.");
//       }

      
//   } catch (error) {
//     console.error("Error on ReAssigned books:", error);
//   }
// }

async function Expirebook() {
  console.log("Task executed at:", new Date().toLocaleTimeString());
  
  try {
    const AssignedBooks = await getAssinedDetail(); // Assuming this is an async function
    if (!AssignedBooks || !Array.isArray(AssignedBooks)) {
      console.log("No assigned books found or data is not an array.");
      return; // Exit if no data
    }
    
    console.log("Assigned Books:", JSON.stringify(AssignedBooks, null, 2));
    const Current_date = new Date();
    
    AssignedBooks.forEach(book => {
      console.log("Expire Date:", book.ExpireDate); // Accessing ExpireDate for each book
      
      const expireDate = new Date(book.ExpireDate);

      if (expireDate < Current_date) {
        console.log(`Book ID ${book.Book_id} has expired.`, expireDate.toLocaleDateString());
        console.log(`User ID ${book.User_id} has expired.`);
      expireDate.setDate(expireDate.getDate() + 30); // Add 30 days


         ReAssinedBook(expireDate, book.Book_id, book.User_id);

      } else {
        console.log(`Book ID ${book.Book_id} is still valid.`);
      }
    });
  } catch (error) {
    console.error("Error processing assigned books:", error);
  }
}

// async function ExelExport(req,res) {
  
//   try {
//     const AssignedBooks = await getAssinedDetail(); // Assuming this is an async function
//     if (!AssignedBooks || !Array.isArray(AssignedBooks)) {
//       console.log("No assigned books found or data is not an array.");
//       return; // Exit if no data
//     }
    
//     console.log("Assigned Books:", JSON.stringify(AssignedBooks, null, 2));
//     const data = [
//       ['Id', 'User_id', 'Book_id', 'Assigned_by', 'Date', 'ExpireDate', 'is_Assigned', 'Book_Title', 'Book_Author', 'User_Name'], // Header Row
//     ] ;

//     AssignedBooks.forEach((book) => {
//       data.push([
//           book.Id,
//           book.User_id,
//           book.Book_id,
//           book.Assined_by,
//           book.Date,
//           book.ExpireDate,
//           book.is_Assined,
//           book.Book_Title,
//           book.Book_Author,
//           book.User_Name,
//       ]);
//     });     
    
//     const buffer = xlsx.build([{ name: 'Assigned Books', data }]);

//     // Send the file as a downloadable response
//     res.setHeader('Content-Disposition', 'attachment; filename="AssignedBooks.xlsx"');
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.send(buffer);

    
//   } catch (error) {
//     console.error("Error processing in Exporting assigned books:", error);
//   }
// }

async function ExelExport(req, res) {
  try {
    const AssignedBooks = await getAssinedDetail(); // Assuming this is an async function to get assigned book details
    if (!AssignedBooks || !Array.isArray(AssignedBooks)) {
      console.log("No assigned books found or data is not an array.");
      return res.status(404).send("No assigned books found."); // Send an error response
    }
    
    console.log("Assigned Books:", JSON.stringify(AssignedBooks, null, 2));

    // Prepare data for Excel sheet
    const data = [
      ['Id', 'User_id', 'Book_id', 'Assigned_by', 'Date', 'ExpireDate', 'is_Assigned', 'Book_Title', 'Book_Author', 'User_Name'], // Header Row
    ];

    // Populate the data with the books
    AssignedBooks.forEach((book) => {
      data.push([
        book.Id,
        book.User_id,
        book.Book_id,
        book.Assined_by,
        book.Date,
        book.ExpireDate,
        book.is_Assined,
        book.Book_Title,
        book.Book_Author,
        book.User_Name,
      ]);
    });

    console.log("Assigned Books:", data);


    // Build Excel file
    const buffer = xlsx.build([{ name: 'Assigned Books', data }]);

    // Send the Excel file as a response
    res.setHeader('Content-Disposition', 'attachment; filename="AssignedBooks.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error("Error processing in exporting assigned books:", error);
    res.status(500).send("Error exporting assigned books.");
  }
}

module.exports = {
  signup,
  login,
  BookAssined,
  AssinedDetail,
  Expirebook,
  ExelExport,
};
