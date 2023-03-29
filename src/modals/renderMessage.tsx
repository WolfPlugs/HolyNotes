import { common, webpack, components } from "replugged";
import noteHandler from "../noteHandler";
import { getExportsForProto, MyClipboardUtility } from "../noteHandler/utils";

const classes = webpack.getByProps("cozyMessage");
const { ChannelMessage } = webpack.getBySource("flashKey");

const RoutingUtilsModule = webpack.getBySource("transitionTo - Transitioning to ");
const RoutingUtils = {
  transitionToChannel: webpack.getFunctionBySource(
    RoutingUtilsModule,
    "transitionTo - Transitioning to ",
  ),
};

const Timestamp = webpack.getBySource("parseTwoDigitYear");

const Message = await webpack.waitForModule<any>((m) =>
  Boolean(getExportsForProto(m.exports, ["getReaction", "isSystemDM"])),
);

const User = webpack.getModule((m) => Boolean(getExportsForProto(m.exports, ["tag", "isClyde"])));

const Channel = getExportsForProto(
  await webpack.waitForModule<any>((m) => Boolean(getExportsForProto(m.exports, ["getGuildId"]))),
  ["getGuildId"],
);

// replugged.webpack.getModule((m) => ["getGuildId"].every((p) => Object.values(m.exports).some((m) => m?.prototype?.[p]))).Sf

const {
  React,
  contextMenu: { open, close },
} = common;
const { FormItem, Divider, ContextMenu } = components;

let isHoldingDelete;
// React.useEffect(() => {

//   const deleteHandler = (e) => e.key === 'Delete' && (isHoldingDelete = e.key === 'keydown')

//   document.addEventListener('keydown', deleteHandler)
//   document.addEventListener('keyup', deleteHandler)

//   return () => {
//     document.removeEventListener('keydown', deleteHandler)
//     document.removeEventListener('keyup', deleteHandler)
//   }
// }, [])

export default ({ note, notebook, updateParent, fromDeleteModal, closeModal }) => {
  return (
    <div
      className="holy-note"
      onClick={() => {
        if (isHoldingDelete && !fromDeleteModal) {
          noteHandler.deleteNote(note.id, notebook);
          updateParent();
        }
      }}
      onContextMenu={(event) => {
        if (!fromDeleteModal)
          return open(event, (props) => (
            <NoteContextMenu
              {...Object.assign({}, props, { onClose: close })}
              note={note}
              notebook={notebook}
              updateParent={updateParent}
              closeModal={closeModal}
            />
          ));
      }}>
      <ChannelMessage
        style={{
          marginBottom: "5px",
          marginTop: "5px",
          paddingTop: "5px",
          paddingBottom: "5px",
        }}
        className={[classes.message, classes.cozyMessage, classes.groupStart].join(" ")}
        message={
          new Message(
            Object.assign(
              { ...note },
              {
                author: new User({ ...note.author }),
                timestamp: new Timestamp(new Date(note.timestamp)),
                embeds: note.embeds.map((embed) =>
                  embed.timestamp
                    ? Object.assign(embed, {
                        timestamp: new Timestamp(new Date(embed.timestamp)),
                      })
                    : embed,
                ),
              },
            ),
          )
        }
        channel={new Channel({ id: "holy-notes" })}
        compact={false}
        isHighlight={false}
        isLastItem={false}
        renderContentOnly={false}
      />
      {console.log(
        <ChannelMessage
          style={{
            marginBottom: "5px",
            marginTop: "5px",
            paddingTop: "5px",
            paddingBottom: "5px",
          }}
          className={[classes.message, classes.cozyMessage, classes.groupStart].join(" ")}
          message={
            new Message(
              Object.assign(
                { ...note },
                {
                  author: new User({ ...note.author }),
                  timestamp: new Timestamp(new Date(note.timestamp)),
                  embeds: note.embeds.map((embed) =>
                    embed.timestamp
                      ? Object.assign(embed, {
                          timestamp: new Timestamp(new Date(embed.timestamp)),
                        })
                      : embed,
                  ),
                },
              ),
            )
          }
          channel={new Channel({ id: "holy-notes" })}
          compact={false}
          isHighlight={false}
          isLastItem={false}
          renderContentOnly={false}
        />,
      )}
    </div>
  );
};

const NoteContextMenu = (props) => {
  const { note, notebook, updateParent, closeModal } = props;
  return (
    <ContextMenu.ContextMenu {...props}>
      <ContextMenu.MenuItem
        label="Jump to message"
        id="jump"
        action={() => {
          RoutingUtils.transitionToChannel(
            `/channels/${note.guild_id ?? "@me"}/${note.channel_id}/${note.id}`,
          );
          closeModal();
        }}
      />
      <ContextMenu.MenuItem
        label="Copy Text"
        id="ctext"
        action={() => MyClipboardUtility.copyToClipboard(note.content)}
      />
      <ContextMenu.MenuItem
        color="danger"
        label="Delete Note"
        id="delete"
        action={() => {
          noteHandler.deleteNote(note.id, notebook);
          updateParent();
        }}
      />
      {Object.keys(noteHandler.getNotes()).length !== 1 ? (
        <ContextMenu.MenuItem
          label="Move Note"
          id="move"
          children={Object.keys(noteHandler.getNotes()).map((key: string) => {
            if (key !== notebook) {
              return (
                <FormItem
                  label={`Move to ${key}`}
                  id={key}
                  action={() => {
                    noteHandler.moveNote(note.id, notebook, key);
                    updateParent();
                  }}
                />
              );
            }
          })}
        />
      ) : null}
      <ContextMenu.MenuItem
        label="Copy Id"
        id="cid"
        action={() => MyClipboardUtility.copyToClipboard(note.id)}
      />
    </ContextMenu.ContextMenu>
  );
};
