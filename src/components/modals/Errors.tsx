import { webpack } from "replugged";

const classes = await webpack.waitForModule<{
  emptyResultsWrap: string;
  emptyResultsContent: string;
  errorImage: string;
  emptyResultsText: string;
  noResultsImage: string;
  alt: string;
}>(webpack.filters.byProps("emptyResultsWrap"));

export default ({ error }: { error?: Error } = {}) => {
  if (error) {
    // Error
    console.log(error);
    return (
      <div className={classes.emptyResultsWrap}>
        <div className={classes.emptyResultsContent} style={{ paddingBottom: "0px" }}>
          <div className={classes.errorImage} />
          <div className={classes.emptyResultsText}>
            There was an error parsing your notes! The issue was logged in your console, press CTRL
            + I to access it! Please visit the support server if you need extra help!
          </div>
        </div>
      </div>
    );
  } else if (Math.floor(Math.random() * 100) <= 10)
    // Easter egg
    return (
      <div className={classes.emptyResultsWrap}>
        <div className={classes.emptyResultsContent} style={{ paddingBottom: "0px" }}>
          <div className={`${classes.noResultsImage} ${classes.alt}`} />
          <div className={classes.emptyResultsText}>
            No notes were found. Empathy banana is here for you.
          </div>
        </div>
      </div>
    );
  // Empty notebook
  else
    return (
      <div className={classes.emptyResultsWrap}>
        <div className={classes.emptyResultsContent} style={{ paddingBottom: "0px" }}>
          <div className={classes.noResultsImage} />
          <div className={classes.emptyResultsText}>
            No notes were found saved in this notebook.
          </div>
        </div>
      </div>
    );
};
