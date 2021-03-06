const asyncHandler = require("../utilities/asyncHandler/asyncHandler");
const errorResponse = require("../utilities/errorResponse/errorResponse.js");
const models = require("../models");
const edeskio_models = models.edeskio.models;
const db = require("../models/index");
const moment = require("moment");
const sequelize = require("sequelize");
const bcrypt = require("bcryptjs");
const Op = sequelize.Op;

const get_tblRoles_All = asyncHandler(async (req, res, next) => {
  try {
    const { organizationID } = req.query;

    const tblRoles = await edeskio_models.tblRoles.findAll();

    const tblAccess = await edeskio_models.tblAccess.findAll({});

    const tblUsers = await edeskio_models.tblUsers.findAll({
      where: { CompanyID: organizationID },
    });

    return res.status(200).json({ tblRoles, tblAccess, tblUsers });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblTags_All = asyncHandler(async (req, res, next) => {
  try {
    const tblTags = await edeskio_models.tblTags.findAll();
    return res.status(200).json({ tblTags });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblUser = asyncHandler(async (req, res, next) => {
  try {
    const { username } = req.query;

    const tblUser = await edeskio_models.tblUsers.findOne({
      where: {
        UserName: username,
      },
    });

    const tblOrganization = await edeskio_models.tblOrganizations.findOne({
      where: {
        ID: tblUser.dataValues.CompanyID,
      },
    });

    const tblAccess = await edeskio_models.tblAccess.findOne({
      where: {
        UserID: tblUser.dataValues.ID,
      },
    });

    return res.status(200).json({ tblUser, tblOrganization, tblAccess });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblOrganizations_All = asyncHandler(async (req, res, next) => {
  try {
    const tblOrganizations = await edeskio_models.tblOrganizations.findAll();

    return res.status(200).json({ tblOrganizations });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblUsers_All = asyncHandler(async (req, res, next) => {
  try {
    const { organizationID } = req.query;

    const tblUsers = await edeskio_models.tblUsers.findAll({
      where: {
        CompanyID: organizationID,
      },
    });

    return res.status(200).json({ tblUsers });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblUsers_One = asyncHandler(async (req, res, next) => {
  try {
    const { username } = req.body;

    const tblUsers = await edeskio_models.tblUsers.findOne({
      where: {
        UserName: username,
      },
    });
    return res.status(200).json({ tblUsers });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblTickets = asyncHandler(async (req, res, next) => {
  const { OrganizationID } = req.query;

  try {
    let tblTickets = await edeskio_models.tblTickets.findAll();

    let tblTicketTags = await edeskio_models.tblTicketTags.findAll();

    return res.status(200).json({ tblTickets, tblTicketTags });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const get_tblExpertiseTags_One = asyncHandler(async (req, res, next) => {
  try {
    const { TechnicianID } = req.query;

    console.log(TechnicianID);

    const tblExpertiseTags = await edeskio_models.tblExpertiseTags.findAll({
      where: {
        TechnicianID: TechnicianID,
      },
    });
    return res.status(200).json({ tblExpertiseTags });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const post_tblTickets_NewTicket = asyncHandler(async (req, res, next) => {
  try {
    const { UserID, Subject, Description, SubmissionDate, Tags } = req.body;

    const tblTickets = await edeskio_models.tblTickets.create({
      UserID: UserID,
      Subject: Subject,
      Description: Description,
      SubmissionDate: SubmissionDate,
      Status: "Pending",
      Priority: "Medium",
    });

    for (const tag of Tags) {
      const tblTicketTags = await edeskio_models.tblTicketTags.create({
        TicketID: tblTickets.dataValues.ID,
        TagType: tag,
      });
    }

    return res.status(200).json({ msg: "Success" });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const post_tblExpertiseTags = asyncHandler(async (req, res, next) => {
  try {
    const { UserID, Tags } = req.body;

    const currentExpertiseTags = await edeskio_models.tblExpertiseTags.destroy({
      where: {
        TechnicianID: UserID,
      },
    });

    for (const tag of Tags) {
      const tblExpertiseTags = await edeskio_models.tblExpertiseTags.create({
        TechnicianID: UserID,
        TagType: tag,
      });
    }

    const tblExpertiseTags = await edeskio_models.tblExpertiseTags.findAll({
      where: {
        TechnicianID: UserID,
      },
    });
    return res.status(200).json({ tblExpertiseTags });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const post_tblUsers_tblOrganization_Register_NewOrganization = asyncHandler(
  async (req, res, next) => {
    try {
      const { email, userName, password, firstName, lastName, companyName } =
        req.body;

      const tblOrganizationsInsert =
        await edeskio_models.tblOrganizations.create({
          Name: companyName,
        });

      const tblOrganizationsSelect =
        await edeskio_models.tblOrganizations.findOne({
          where: {
            Name: companyName,
          },
        });

      const hashedPassword = await bcrypt.hash(password, 10);

      const tblUsers = await edeskio_models.tblUsers.create({
        Email: email,
        UserName: userName,
        Password: hashedPassword,
        FirstName: firstName,
        LastName: lastName,
        // DateCreated: dateCreated,
        // LastLogin: lastLogin,
        Approved: true,
        CompanyID: tblOrganizationsSelect.dataValues.ID,
      });

      const tblUsersSelect = await edeskio_models.tblUsers.findOne({
        where: {
          Email: email,
          UserName: userName,
          Password: hashedPassword,
        },
      });

      const tblAccess = await edeskio_models.tblAccess.create({
        UserID: tblUsersSelect.dataValues.ID,
        RoleName: "Admin",
      });

      return res.status(200).json({ msg: "Success" });
    } catch (error) {
      // return res.status(500).send(error.message);
      return next(new errorResponse(error.message, 500));
    }
  }
);

const post_tblUsers_tblOrganization_Register_ExistingOrganization =
  asyncHandler(async (req, res, next) => {
    try {
      const { email, userName, password, firstName, lastName, companyName } =
        req.body;

      const tblOrganizationsSelect =
        await edeskio_models.tblOrganizations.findOne({
          where: {
            Name: companyName,
          },
        });

      const hashedPassword = await bcrypt.hash(password, 10);

      const tblUsers = await edeskio_models.tblUsers.create({
        Email: email,
        UserName: userName,
        Password: hashedPassword,
        FirstName: firstName,
        LastName: lastName,
        // DateCreated: dateCreated,
        // LastLogin: lastLogin,
        CompanyID: tblOrganizationsSelect.dataValues.ID,
      });

      const tblUsersSelect = await edeskio_models.tblUsers.findOne({
        where: {
          Email: email,
          UserName: userName,
          Password: hashedPassword,
        },
      });

      const tblAccess = await edeskio_models.tblAccess.create({
        UserID: tblUsersSelect.dataValues.ID,
        RoleName: "Basic",
      });

      return res.status(200).json({ msg: "Success" });
    } catch (error) {
      // return res.status(500).send(error.message);
      return next(new errorResponse(error.message, 500));
    }
  });

const put_tblTickets_SelfAssign = asyncHandler(async (req, res, next) => {
  try {
    const { TicketID, TechnicianID, OpenDate } = req.body;

    let tblTickets;

    tblTickets = await edeskio_models.tblTickets.findOne({
      where: {
        ID: TicketID,
      },
    });

    tblTickets.set({
      TechnicianID: TechnicianID,
      Status: "Open",
      OpenDate: OpenDate,
    });

    await tblTickets.save();

    tblTickets = await edeskio_models.tblTickets.findAll();

    let tblTicketTags = await edeskio_models.tblTicketTags.findAll();

    return res.status(200).json({ tblTickets, tblTicketTags });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const put_tblUsers_Approved = asyncHandler(async (req, res, next) => {
  try {
    const { UserID, status, organizationID } = req.body;

    let tblUsers;

    tblUsers = await edeskio_models.tblUsers.findOne({
      where: {
        ID: UserID,
      },
    });

    tblUsers.set({
      Approved: status,
    });

    await tblUsers.save();

    tblUsers = await edeskio_models.tblUsers.findAll({
      where: {
        CompanyID: organizationID,
      },
    });

    return res.status(200).json({ tblUsers });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

const put_tblPermissions = asyncHandler(async (req, res, next) => {
  try {
    const { updatedRow, oldRow, organizationID } = req.body;

    let tblAccess;

    tblAccess = await edeskio_models.tblAccess.findOne({
      where: {
        ID: updatedRow.ID,
      },
    });

    tblAccess.set({
      RoleName: updatedRow.RoleName,
    });

    await tblAccess.save();

    tblAccess = await edeskio_models.tblAccess.findAll();

    const tblUsers = await edeskio_models.tblUsers.findAll({
      where: { CompanyID: organizationID },
    });

    const tblRoles = await edeskio_models.tblRoles.findAll();

    return res.status(200).json({ tblAccess, tblUsers, tblRoles });
  } catch (error) {
    // return res.status(500).send(error.message);
    return next(new errorResponse(error.message, 500));
  }
});

module.exports = {
  get_tblRoles_All,
  get_tblOrganizations_All,
  get_tblTags_All,
  get_tblUser,
  get_tblTickets,
  get_tblUsers_One,
  get_tblUsers_All,
  get_tblExpertiseTags_One,
  post_tblUsers_tblOrganization_Register_NewOrganization,
  post_tblUsers_tblOrganization_Register_ExistingOrganization,
  post_tblTickets_NewTicket,
  post_tblExpertiseTags,
  put_tblTickets_SelfAssign,
  put_tblPermissions,
  put_tblUsers_Approved,
};
