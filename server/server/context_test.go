// Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.
//
// For more information, please visit: https://github.com/tengge1/ShadowEditor
// You can also visit: https://gitee.com/tengge1/ShadowEditor

package server

import "testing"

func TestCreate(t *testing.T) {
	Create("../config.toml")
	t.Log(Config)
	Logger.Info("Some info from context_test.go")

	mong, err := Mongo()
	if err != nil {
		t.Error(err)
		return
	}

	collectionNames := mong.ListCollectionNames()

	for _, collectionName := range collectionNames {
		t.Log(collectionName)
	}
}
