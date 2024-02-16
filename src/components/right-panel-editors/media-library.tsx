import strings from "../../localization/strings";
import styles from "../../styles/components/right-panel-editors/media-library";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import { useState, useEffect, MouseEvent } from "react";
import { AccessToken, MediaType } from "../../types";
import { StoredFile } from "../../generated/client";
import Api from "../../api/api";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from '@mui/icons-material/Image';
import VideoIcon from '@mui/icons-material/VideoFile';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import NewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadIcon from '@mui/icons-material/CloudUpload';
import FileUpload from "../../utils/file-upload";
import FileUploader from "../generic/file-uploader";
import CreateMediaFolderDialog from "../generic/create-media-folder-dialog";
import FileUtils from "../../utils/file-utils";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  startsOpen?: boolean;
  currentUrl: string | undefined;
  accessToken: AccessToken;
  mediaType: MediaType;
  onUrlChange: (newUrl: string) => void;
  setError: (error: Error) => void;
}

/**
 * Folder content type
 */
const FOLDER_CONTENT_TYPE = "inode/directory";

/**
 * Media library component 
 */
const MediaLibrary: React.FC<Props> = ({ 
  startsOpen, 
  accessToken,
  currentUrl,
  classes, 
  setError, 
  onUrlChange
}) => {
  const [ loading, setLoading ] = useState(false);
  const [ expanded, setExpanded ] = useState(startsOpen || false);
  const [ uploadDialogOpen, setUploadDialogOpen ] = useState(false);
  const [ newFolderDialogOpen, setNewFolderDialogOpen ] = useState(false);
  const [ folder, setFolder ] = useState(currentUrl ? FileUtils.resolveFilePathFolder(FileUtils.resolveFileUriPath(currentUrl)) || "/" : "/");
  const [ files, setFiles ] = useState<StoredFile[]>([]);
  const [ sortedFiles, setSortedFiles ] = useState<StoredFile[]>([]);

  /**
   * Sorts files by name and type
   * 
   * @param files unsorted files
   * @returns sorted files
   */
  const sortFiles = (files: StoredFile[]) => files
    .filter((file) => {
      return !!file.fileName;
    })
    .filter((file) => {
      return FileUtils.resolveFilePath(file) !== folder;
    })
    .sort((a, b) => {
      return b.fileName.localeCompare(a.fileName);
    })
    .sort((a, b) => {
      if (a.contentType === b.contentType) {
        return 0;
      }

      if (a.contentType === FOLDER_CONTENT_TYPE) {
        return -1;
      }

      if (b.contentType === FOLDER_CONTENT_TYPE) {
        return 1;
      }

      return 0;
    });
  
  /**
   * Lists files in a folder
   * 
   * @param folder folder
   * @returns files
   */
  const listFiles = async (folder: string) => {
    const mediaApi = Api.getStoredFilesApi(accessToken);

    return await mediaApi.listStoredFiles({
      folder: folder
    });
  };

  /**
   * Reloads the current folder
   */
  const reloadFolder = async () => {
    setLoading(true);

    try {
      const files = await listFiles(folder);
      setFiles(files);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    } 
  };

  /**
   * Resolves file name from given file
   * 
   * @param file file
   * @returns file name
   */
  const resolveFileName = (file: StoredFile) => {
    const uri = file.uri.replace(/\/$/, "");
    return uri.split("/").pop();
  };

  /**
   * Resolves parent folder from given folder
   * 
   * @param folder folder
   * @returns parent folder
   */
  const resolveParentFolder = (folder: string) => {
    return folder.replace(/\/$/, "").split("/").slice(0, -1).join("/") || "/";
  }

  /**
   * Navigates to parent folder
   */
  const navigateToParentFolder = () => {
    setFolder(resolveParentFolder(folder));
  };

  /**
   * Toggles accordion expanded
   */
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  /**
   * Close event handler for upload dialog
   */
  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
  }

  /**
   * Save event handler for upload dialog
   * 
   * @param files uploaded files
   * @param _key key (unused)
   */
  const onUploadSave = async (files: File[], _key?: string) => {
    const parentFolder = folder
      .replace(/\/{1,}/g, "/")
      .replace(/^\//, "")
      .replace(/\/$/, "");

    await Promise.all(files.map(async (file) => {
      const presignedPostResponse = await FileUpload.getPresignedPostData(parentFolder, file);
      if (presignedPostResponse.error) {
        throw new Error(presignedPostResponse.message || "Error when creating presigned post request");
      }

      await FileUpload.uploadFileToS3(presignedPostResponse.data, file);
    }));
    
    setUploadDialogOpen(false);
    reloadFolder();
  };

  /**
   * Event handler for reload folder click
   * 
   * @param event event
   */
  const onReloadFolderClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    reloadFolder();
  };

  /**
   * Event handler for new folder click
   * 
   * @param event event
   */
  const onNewFolderClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setNewFolderDialogOpen(true);
  }

  /**
   * Event handler for upload icon click
   * 
   * @param event event
   */
  const onUploadIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setUploadDialogOpen(true);
  }

  /**
   * Renders icon for a file
   * 
   * @param file file
   * @returns rendered icon
   */
  const renderFileIcon = (file: StoredFile) => {
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".tif", ".tiff"];
    const videoExtensions = [".mp4", ".webm", ".ogg"];

    if (file.contentType === FOLDER_CONTENT_TYPE) {
      return <FolderIcon />;
    }

    if (file.contentType.startsWith("image")) {
      return <ImageIcon />;
    }

    if (file.contentType.startsWith("video")) {
      return <VideoIcon />;
    }

    if (imageExtensions.find((ext) => file.fileName.toLocaleLowerCase().endsWith(ext))) {
      return <ImageIcon />;
    }

    if (videoExtensions.find((ext) => file.fileName.toLocaleLowerCase().endsWith(ext))) {
      return <VideoIcon />;
    }

    return <FileIcon />;
  }

  /**
   * Renders file
   * 
   * @param file file
   * @returns rendered file
   */
  const renderFile = (file: StoredFile) => {
    const onClick = () => {
      if (file.contentType === FOLDER_CONTENT_TYPE) {
        setFolder(FileUtils.resolveFilePath(file));
        return;
      }

      onUrlChange(file.uri);
    };

    const name = resolveFileName(file);
    const action = file.uri == currentUrl;

    return (
      <ListItem disablePadding key={file.fileName} onClick={ onClick } className={ action ? classes.activeListItem : "" }>
        <ListItemButton>
          <ListItemIcon>
            { renderFileIcon(file) }
          </ListItemIcon>
          <ListItemText 
            primary={ <span title={ name } className={ classes.fileName }>{ name }</span> } 
          />
        </ListItemButton>        
      </ListItem>
    );
  };

  /**
   * Renders parent navigation if folder is not root
   * 
   * @returns rendered parent navigation
   */
  const renderParentNavigation = () => {
    if (folder === "/") {
      return null;
    }

    return (
      <ListItem disablePadding onClick={ navigateToParentFolder }>
        <ListItemButton>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary=".." />
        </ListItemButton>
      </ListItem>
    )
  };

  /**
   * Renders file list
   * 
   * @returns rendered file list
   */
  const renderFileList = () => {
    return (
      <>
        <List>
          {
            renderParentNavigation()
          }
          {
            sortedFiles.map(renderFile)
          }
        </List>
      </>
    );
  }

  /**
   * Render upload dialog
   */
  const renderUploadDialog = () => {
    return (
      <FileUploader
        controlled
        filesLimit={ 1000 }
        maxFileSize={ 1073741824 }
        open={ uploadDialogOpen }
        onClose={ closeUploadDialog }
        buttonText={ strings.mediaLibrary.addMedia }
        allowedFileTypes={ [] }
        onSave={ onUploadSave }
      />
    );
  };

  /**
   * Renders create new folder dialog
   * 
   * @returns rendered create new folder dialog
   */
  const renderCreateNewFolderDialog = () => {
    return (
      <CreateMediaFolderDialog 
        open={ newFolderDialogOpen }
        onClose={ () => setNewFolderDialogOpen(false) }
        onSave={ async (folderName: string) => {
          setNewFolderDialogOpen(false);
          const parentFolder = folder.replace(/^\//, "");
          const newFolder = `${parentFolder}/${folderName}`.replace(/^\//, "");
          const fileName = newFolder.split("/").pop() as string;
          const parentFolderName = newFolder.split("/").filter(folder => !!folder).slice(0, -1).join("/");

          const folderData = new Blob([], { type: FOLDER_CONTENT_TYPE});
          const folderFile = new File([ folderData ], fileName.endsWith("/") ? fileName : `${fileName}/`, { type: folderData.type });
          
          await FileUpload.uploadFile(
            folderFile,
            parentFolderName
          );

          await reloadFolder();
        }}
      /> 
    );
  }

  /**
   * Renders accordion contents
   * 
   * @returns rendered accordion contents
   */
  const renderContents = () => {
    if (loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={50} color="secondary" />
        </div>
      );
    }

    return (
      <>
        { renderFileList()}
      </>
    );
  };

  useEffect(() => {
    setSortedFiles(sortFiles(files));
  }, [files]);

  useEffect(() => {
    setLoading(true);

    listFiles(folder) 
      .then((files) => {
        setFiles(files);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
      });
  }, [folder]);

  return (
    <> 
      <Accordion expanded={expanded}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={ toggleExpanded }
        >
          <Typography variant="h3">{strings.mediaLibrary.title}</Typography>
          <Box>
            <IconButton onClick={ onReloadFolderClick }>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={ onNewFolderClick }>
              <NewFolderIcon />
            </IconButton>
            <IconButton onClick={ onUploadIconClick }>
              <UploadIcon />
            </IconButton>
          </Box>
        </AccordionSummary>
        <AccordionDetails className={ classes.accordionDetails }>
          { renderContents() }  
        </AccordionDetails>
      </Accordion>
      { renderUploadDialog() }
      { renderCreateNewFolderDialog() }
    </>
  );
};

export default withStyles(styles)(MediaLibrary);