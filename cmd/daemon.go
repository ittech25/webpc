package cmd

import (
	"log"

	"gitlab.com/king011/webpc/cmd/daemon"
	"gitlab.com/king011/webpc/configure"
	"gitlab.com/king011/webpc/cookie"
	"gitlab.com/king011/webpc/logger"
	"gitlab.com/king011/webpc/utils"

	"github.com/spf13/cobra"
)

func init() {
	var filename string
	basePaht := utils.BasePath()
	cmd := &cobra.Command{
		Use:   "daemon",
		Short: "run as daemon",
		Run: func(cmd *cobra.Command, args []string) {
			// load configure
			cnf := configure.Single()
			e := cnf.Load(basePaht, filename)
			if e != nil {
				log.Fatalln(e)
			}
			e = cnf.Format()
			if e != nil {
				log.Fatalln(e)
			}

			// init logger
			e = logger.Init(basePaht, &cnf.Logger)
			if e != nil {
				log.Fatalln(e)
			}

			// init cookie
			e = cookie.Init(cnf.Cookie.Filename, cnf.Cookie.MaxAge)
			if e != nil {
				log.Fatalln(e)
			}

			// run
			daemon.Run()
		},
	}
	flags := cmd.Flags()
	flags.StringVarP(&filename, "config",
		"c",
		utils.Abs(basePaht, "webpc.jsonnet"),
		"configure file",
	)
	rootCmd.AddCommand(cmd)
}
