UserData_RegisterTab(
    {
        name: "DotStar LED",
        page: [
            {
                group:"Network",
                item:["Port"],
                checkFormValues: function() {
                    PrintMsg("");
                    var a = UserData_GetValue("Port");
                    if(a && ! a.match(/^\d+$/)) {
                        PrintMsg("ERROR: Port number must be numeric.\r");
                        return false;
                    }
                    return true;
                }
            }
        ]
    }
);
