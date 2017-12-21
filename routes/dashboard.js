const sql = require('sqlite');

module.exports = {
    async execute(req, res) {
        let backEnd_err;
        try {
                if(Object.keys(req.query).length === 0)
                        return res.send('|Eros|Invalid API request: empty query.');
                // localhost/dashboard?id={khID}&ses={sID}&k={sPW}
                const row  =  await sql.get(`SELECT * FROM kamihime WHERE khID='${req.query.id}'`);
                const session = await sql.get(`SELECT * FROM sessions WHERE sID='${req.query.ses}'`);

                if(!row)
                        throw backEnd_err = '|Eros|Character ID is invalid. Are trying to guess?';
                if(!session)
                        throw backEnd_err = '|Eros|Your session is invalid. Please ask for one in my Discord department.';
                if(req.query.k !== session.sPW)
                        throw backEnd_err = '|Eros|Your session is invalid. Please ask for one in my Discord department.';
                if(row.khApproved)
                        throw backEnd_err = '|Eros|This character is approved. Contact the administrator if there is something wrong.';
                res.render(`dashboard`, { json: row, user: session });
        }
        catch (err) {
                if(backEnd_err)
                        res.send(err.toString().replace(/'/g, ''));
        }
    }
};