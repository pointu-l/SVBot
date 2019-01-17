import SVBot from "./SVBot"

process.chdir("/root/java_svn");

new SVBot({
    morningHour: "09:00",
    lunchHour: "12:00",
    afternoonHour: "13:00",
    endOfDayHour: "17:00"
}).init();
